import { create } from 'zustand';
import { CardId, CARDS, HAND_SIZE, INITIAL_DECK } from '../game/cards';
import {
  BASE_VOLATILITY,
  INITIAL_PRICE,
  calcNextPrice,
  formatPrice,
  formatPercent,
} from '../game/market';

export const TOTAL_DAYS = 20;
export const INITIAL_CASH = 10_000;
export const WIN_GOAL = 100_000;

export type GamePhase = 'draw' | 'play' | 'resolve' | 'upgrade';
export type GameStatus = 'playing' | 'win' | 'lose';

export type PendingEffect = {
  forcedDelta: number;       // 다음 턴 주가에 가할 강제 변동
  volatilityMultiplier: number; // 다음 턴 변동성 배수
  revealDirection: boolean;  // 다음 턴 방향 공개 여부
  leverageMultiplier: number; // 레버리지 배수
};

export type GameState = {
  // 상태
  status: GameStatus;
  phase: GamePhase;
  day: number;

  // 자산
  cash: number;
  shares: number;       // 보유 주식 수량
  sharesBought: number; // 매수 단가 기준 수량 (레버리지 계산용)
  avgBuyPrice: number;  // 평균 매수가

  // 주가
  currentPrice: number;
  priceHistory: number[]; // 오늘까지의 주가 히스토리
  volatility: number;

  // 카드
  deck: CardId[];
  hand: CardId[];
  playedCards: CardId[]; // 이번 턴에 사용한 카드

  // 다음 턴 대기 효과
  pending: PendingEffect;

  // 통계
  peakAssets: number;
  nextPriceDirection: 'up' | 'down' | null; // 내부자 정보로 공개된 방향

  // 액션
  startGame: () => void;
  playCard: (cardIndex: number, livePrice?: number) => void;
  endTurn: () => void;
  setCurrentPrice: (price: number) => void;
};

const DEFAULT_PENDING: PendingEffect = {
  forcedDelta: 0,
  volatilityMultiplier: 1,
  revealDirection: false,
  leverageMultiplier: 1,
};

function drawHand(deck: CardId[]): { hand: CardId[]; remaining: CardId[] } {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  return {
    hand: shuffled.slice(0, HAND_SIZE),
    remaining: shuffled.slice(HAND_SIZE),
  };
}

// 다양성 가중 뽑기: 손패에 없는 카드 종류를 3배 높은 확률로 뽑음
function weightedDraw(pool: CardId[], existingHand: CardId[], count: number): { drawn: CardId[]; remaining: CardId[] } {
  const poolCopy = [...pool];
  const drawn: CardId[] = [];
  const handTypes = new Set(existingHand);

  for (let i = 0; i < count && poolCopy.length > 0; i++) {
    const weights = poolCopy.map(c => handTypes.has(c) ? 1 : 3);
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    let idx = poolCopy.length - 1;
    for (let j = 0; j < weights.length; j++) {
      rand -= weights[j];
      if (rand <= 0) { idx = j; break; }
    }
    drawn.push(poolCopy[idx]);
    handTypes.add(poolCopy[idx]);
    poolCopy.splice(idx, 1);
  }
  return { drawn, remaining: poolCopy };
}

export const useGameStore = create<GameState>((set, get) => ({
  status: 'playing',
  phase: 'draw',
  day: 1,

  cash: INITIAL_CASH,
  shares: 0,
  sharesBought: 0,
  avgBuyPrice: 0,

  currentPrice: INITIAL_PRICE,
  priceHistory: [INITIAL_PRICE],
  volatility: BASE_VOLATILITY,

  deck: [...INITIAL_DECK],
  hand: [],
  playedCards: [],

  pending: { ...DEFAULT_PENDING },
  peakAssets: INITIAL_CASH,
  nextPriceDirection: null,

  startGame: () => {
    const { hand: rawHand, remaining: rawRemaining } = drawHand([...INITIAL_DECK]);
    const buyTypes: CardId[] = ['buy', 'partial_buy'];
    let hand = [...rawHand];
    let remaining = [...rawRemaining];

    // 첫 손패에 매수 카드 2장 이상 보장
    const buyInHand = hand.filter(c => buyTypes.includes(c)).length;
    if (buyInHand < 2) {
      const needed = 2 - buyInHand;
      for (let i = 0; i < needed; i++) {
        const deckBuyIdx = remaining.findIndex(c => buyTypes.includes(c));
        if (deckBuyIdx === -1) break;
        const handNonBuyIdx = hand.findIndex(c => !buyTypes.includes(c));
        if (handNonBuyIdx === -1) break;
        remaining.push(hand[handNonBuyIdx]);
        hand[handNonBuyIdx] = remaining[deckBuyIdx];
        remaining.splice(deckBuyIdx, 1);
      }
    }

    set({
      status: 'playing',
      phase: 'play',
      day: 1,
      cash: INITIAL_CASH,
      shares: 0,
      sharesBought: 0,
      avgBuyPrice: 0,
      currentPrice: INITIAL_PRICE,
      priceHistory: [INITIAL_PRICE],
      volatility: BASE_VOLATILITY,
      deck: remaining,
      hand: hand.sort(() => Math.random() - 0.5),
      playedCards: [],
      pending: { ...DEFAULT_PENDING },
      peakAssets: INITIAL_CASH,
      nextPriceDirection: null,
    });
  },

  playCard: (cardIndex: number, livePrice?: number) => {
    const state = get();
    if (state.phase !== 'play') return;

    const cardId = state.hand[cardIndex];
    if (!cardId) return;

    const card = CARDS[cardId];
    const execPrice = livePrice ?? state.currentPrice;
    const newHand = state.hand.filter((_, i) => i !== cardIndex);
    const newPlayed = [...state.playedCards, cardId];
    let newPending = { ...state.pending };
    let newCash = state.cash;
    let newShares = state.shares;
    let newAvgBuyPrice = state.avgBuyPrice;

    switch (cardId) {
      case 'buy': {
        const buyAmount = newCash;
        if (buyAmount <= 0) break;
        const boughtShares = buyAmount / execPrice;
        newShares += boughtShares;
        newAvgBuyPrice =
          (state.avgBuyPrice * state.shares + execPrice * boughtShares) /
          (state.shares + boughtShares);
        newCash = 0;
        break;
      }
      case 'partial_buy': {
        const buyAmount = newCash * 0.5;
        if (buyAmount <= 0) break;
        const boughtShares = buyAmount / execPrice;
        newShares += boughtShares;
        newAvgBuyPrice =
          (state.avgBuyPrice * state.shares + execPrice * boughtShares) /
          (state.shares + boughtShares);
        newCash -= buyAmount;
        break;
      }
      case 'sell': {
        if (newShares <= 0) break;
        newCash += newShares * execPrice;
        newShares = 0;
        newAvgBuyPrice = 0;
        break;
      }
      case 'partial_sell': {
        if (newShares <= 0) break;
        const sellShares = newShares * 0.5;
        newCash += sellShares * execPrice;
        newShares -= sellShares;
        break;
      }
      case 'average_down': {
        const buyAmount = newCash;
        if (buyAmount <= 0) break;
        if (state.avgBuyPrice <= 0 || execPrice >= state.avgBuyPrice) break;
        const boughtShares = (buyAmount * card.effect.buyEfficiency!) / execPrice;
        newShares += boughtShares;
        newAvgBuyPrice =
          (state.avgBuyPrice * state.shares + execPrice * boughtShares) /
          (state.shares + boughtShares);
        newCash = 0;
        break;
      }
      case 'pump': {
        const delta = card.effect.priceMultiplier!;
        newPending.forcedDelta += delta.min + Math.random() * (delta.max - delta.min);
        break;
      }
      case 'fake_news': {
        newPending.volatilityMultiplier *= card.effect.volatilityMultiplier!;
        break;
      }
      case 'insider': {
        newPending.revealDirection = true;
        break;
      }
      case 'leverage': {
        const leveragedAmount = newCash * card.effect.leverageMultiplier!;
        if (leveragedAmount <= 0) break;
        const boughtShares = leveragedAmount / execPrice;
        newShares += boughtShares;
        newAvgBuyPrice = execPrice;
        newCash = 0;
        newPending.leverageMultiplier = card.effect.leverageMultiplier!;
        break;
      }
    }

    // 내부자 정보: 현재 pending 기준으로 방향 예측
    let nextDir = state.nextPriceDirection;
    if (newPending.revealDirection) {
      nextDir = newPending.forcedDelta >= 0 ? 'up' : 'down';
    }

    set({
      hand: newHand,
      playedCards: newPlayed,
      cash: newCash,
      shares: newShares,
      avgBuyPrice: newAvgBuyPrice,
      pending: newPending,
      nextPriceDirection: nextDir,
    });
  },

  endTurn: () => {
    const state = get();
    if (state.status !== 'playing') return;

    const effectiveVolatility = state.volatility * state.pending.volatilityMultiplier;
    const nextPrice = calcNextPrice(
      state.currentPrice,
      effectiveVolatility,
    );

    const newCash = state.cash;

    const newHistory = [...state.priceHistory, nextPrice];
    const totalAssets = newCash + state.shares * nextPrice;
    const newPeak = Math.max(state.peakAssets, totalAssets);

    // 승패 판정
    const isLastDay = state.day >= TOTAL_DAYS;
    let newStatus: GameStatus = 'playing';
    if (totalAssets >= WIN_GOAL) {
      newStatus = 'win';
    } else if (totalAssets < 100 || (isLastDay && totalAssets < WIN_GOAL)) {
      newStatus = 'lose';
    }

    // 남은 손패 유지 + 사용한 카드 덱에 반환 후 빈 자리만 다양성 가중 뽑기로 채우기
    const drawPool = [...state.deck, ...state.playedCards];
    const drawCount = HAND_SIZE - state.hand.length;
    const { drawn: newCards, remaining: newDeck } = weightedDraw(drawPool, state.hand, drawCount);
    const newHand = [...state.hand, ...newCards];

    set({
      currentPrice: nextPrice,
      priceHistory: newHistory,
      cash: newCash,
      day: state.day + 1,
      phase: newStatus === 'playing' ? 'play' : state.phase,
      status: newStatus,
      pending: { ...DEFAULT_PENDING },
      playedCards: [],
      hand: newHand,
      deck: newDeck,
      peakAssets: newPeak,
      nextPriceDirection: null,
      volatility: BASE_VOLATILITY,
    });
  },

  setCurrentPrice: (price: number) => {
    set({ currentPrice: price });
  },
}));

// 셀렉터 헬퍼
export function totalAssets(state: GameState): number {
  return state.cash + state.shares * state.currentPrice;
}

export function formattedAssets(state: GameState): string {
  return formatPrice(totalAssets(state));
}

export function formattedDailyChange(state: GameState): string {
  const history = state.priceHistory;
  if (history.length < 2) return '+0.0%';
  const prev = history[history.length - 2];
  const curr = history[history.length - 1];
  return formatPercent((curr - prev) / prev);
}

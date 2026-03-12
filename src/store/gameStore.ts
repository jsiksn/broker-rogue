import { create } from 'zustand';
import { CardId, CARDS, HAND_SIZE, INITIAL_DECK } from '../game/cards';
import {
  BASE_VOLATILITY,
  INITIAL_PRICE,
  calcNextPrice,
  formatPrice,
  formatPercent,
} from '../game/market';

export const INITIAL_CASH = 10_000;

export type GameMode = 'retail' | 'cartel';

export const MODE_CONFIG: Record<GameMode, { totalDays: number; winGoal: number }> = {
  retail: { totalDays: 10, winGoal: 30_000 },
  cartel: { totalDays: 20, winGoal: 100_000 },
};

export type GamePhase = 'draw' | 'play' | 'resolve' | 'upgrade';
export type GameStatus = 'playing' | 'win' | 'lose';

export type PendingEffect = {
  forcedDelta: number;          // 다음 턴 주가에 가할 강제 변동
  volatilityMultiplier: number; // 다음 턴 변동성 배수
  leverageMultiplier: number;   // 레버리지 배수
  priceBias: number;            // 다음 턴 틱당 바이어스 (내부자 정보)
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
  priceBias: number; // 당일 틱당 바이어스

  // 모드
  mode: GameMode;

  // 액션
  startGame: (mode: GameMode) => void;
  playCard: (cardIndex: number, livePrice?: number) => void;
  endTurn: () => void;
  setCurrentPrice: (price: number) => void;
};

export const BASE_PRICE_BIAS = 0.015;

const DEFAULT_PENDING: PendingEffect = {
  forcedDelta: 0,
  volatilityMultiplier: 1,
  leverageMultiplier: 1,
  priceBias: BASE_PRICE_BIAS,
};

function isRareOrLegendary(c: CardId) {
  return CARDS[c].rarity === 'rare' || CARDS[c].rarity === 'legendary';
}

function drawHand(deck: CardId[]): { hand: CardId[]; remaining: CardId[] } {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  const hand: CardId[] = [];
  const remaining: CardId[] = [];
  const rareInHand = new Set<CardId>();
  for (const c of shuffled) {
    if (hand.length < HAND_SIZE && !(isRareOrLegendary(c) && rareInHand.has(c))) {
      hand.push(c);
      if (isRareOrLegendary(c)) rareInHand.add(c);
    } else {
      remaining.push(c);
    }
  }
  return { hand, remaining };
}

// 드로우 시 매수/매도 각 1장 이상 보장 (총 count장 유지)
function guaranteedDraw(pool: CardId[], existingHand: CardId[], count: number): { drawn: CardId[]; remaining: CardId[] } {
  const buyTypes: CardId[] = ['buy', 'partial_buy'];
  const sellTypes: CardId[] = ['sell', 'partial_sell'];
  const poolCopy = [...pool];
  const drawn: CardId[] = [];
  let remaining = count;

  const forceOne = (types: CardId[], alreadyDrawn: CardId[]) => {
    if (remaining <= 0) return;
    if (existingHand.some(c => types.includes(c))) return;
    if (alreadyDrawn.some(c => types.includes(c))) return;
    const idx = poolCopy.findIndex(c => types.includes(c));
    if (idx === -1) return;
    drawn.push(poolCopy[idx]);
    poolCopy.splice(idx, 1);
    remaining--;
  };

  forceOne(buyTypes, drawn);
  forceOne(sellTypes, drawn);

  const { drawn: rest, remaining: finalPool } = weightedDraw(poolCopy, [...existingHand, ...drawn], remaining);
  return { drawn: [...drawn, ...rest], remaining: finalPool };
}

// 다양성 가중 뽑기: 손패에 없는 카드 종류를 3배 높은 확률로 뽑음
function weightedDraw(pool: CardId[], existingHand: CardId[], count: number): { drawn: CardId[]; remaining: CardId[] } {
  const poolCopy = [...pool];
  const drawn: CardId[] = [];
  const handTypes = new Set(existingHand);
  const drawnTypes = new Set<CardId>();

  for (let i = 0; i < count && poolCopy.length > 0; i++) {
    const weights = poolCopy.map(c => {
      if (isRareOrLegendary(c) && drawnTypes.has(c)) return 0;
      return handTypes.has(c) ? 1 : 3;
    });
    const total = weights.reduce((a, b) => a + b, 0);
    if (total === 0) break;
    let rand = Math.random() * total;
    let idx = poolCopy.length - 1;
    for (let j = 0; j < weights.length; j++) {
      rand -= weights[j];
      if (rand <= 0) { idx = j; break; }
    }
    drawn.push(poolCopy[idx]);
    handTypes.add(poolCopy[idx]);
    drawnTypes.add(poolCopy[idx]);
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
  priceBias: BASE_PRICE_BIAS,
  mode: 'cartel' as GameMode,

  startGame: (mode: GameMode) => {
    const { drawn: hand, remaining } = guaranteedDraw([...INITIAL_DECK], [], HAND_SIZE);

    set({
      mode,
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
      priceBias: BASE_PRICE_BIAS,
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
    let nextDir = state.nextPriceDirection;

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
        const dir: 'up' | 'down' = Math.random() < 0.5 ? 'up' : 'down';
        newPending.priceBias = dir === 'up' ? 0.05 : -0.04;
        nextDir = dir;
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

    const nextPrice = state.currentPrice;

    const newCash = state.cash;

    const newHistory = [...state.priceHistory, nextPrice];
    const totalAssets = newCash + state.shares * nextPrice;
    const newPeak = Math.max(state.peakAssets, totalAssets);

    // 승패 판정
    const { totalDays, winGoal } = MODE_CONFIG[state.mode];
    const isLastDay = state.day >= totalDays;
    let newStatus: GameStatus = 'playing';
    if (totalAssets >= winGoal) {
      newStatus = 'win';
    } else if (totalAssets < 10 || (isLastDay && totalAssets < winGoal)) {
      newStatus = 'lose';
    }

    // 남은 손패 유지 + 사용한 카드 덱에 반환 후 빈 자리만 다양성 가중 뽑기로 채우기
    const drawPool = [...state.deck, ...state.playedCards];
    const drawCount = HAND_SIZE - state.hand.length;
    const { drawn: newCards, remaining: newDeck } = guaranteedDraw(drawPool, state.hand, drawCount);
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
      priceBias: state.pending.priceBias,
      volatility: BASE_VOLATILITY * state.pending.volatilityMultiplier,
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

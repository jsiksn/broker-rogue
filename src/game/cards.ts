export type CardId =
  | 'buy'
  | 'sell'
  | 'partial_buy'
  | 'partial_sell'
  | 'average_down'
  | 'pump'
  | 'fake_news'
  | 'insider'
  | 'leverage';

export type CardRarity = 'common' | 'rare' | 'legendary';

export type CardEffect = {
  // 주가에 강제로 가하는 배율 변화 (0이면 없음)
  priceMultiplier?: { min: number; max: number };
  // 다음 턴 변동성에 곱하는 배수
  volatilityMultiplier?: number;
  // 다음 턴 가격 방향을 미리 공개하는가
  revealNextPrice?: boolean;
  // 레버리지 배수 (매수 시 현금의 N배)
  leverageMultiplier?: number;
  // 매수 효율 배수 (물타기용)
  buyEfficiency?: number;
};

export type Card = {
  id: CardId;
  name: string;
  description: string;
  rarity: CardRarity;
  effect: CardEffect;
  // 사용 시 현금이 필요한가 (매수/레버리지)
  requiresCash: boolean;
  // 주식 보유 시에만 사용 가능한가 (매도/공매도)
  requiresShares: boolean;
};

export const CARDS: Record<CardId, Card> = {
  buy: {
    id: 'buy',
    name: '매수',
    description: '보유 현금으로 주식을 매수한다.',
    rarity: 'common',
    effect: {},
    requiresCash: true,
    requiresShares: false,
  },
  partial_buy: {
    id: 'partial_buy',
    name: '분할 매수',
    description: '보유 현금의 50%로 주식을 매수한다.',
    rarity: 'common',
    effect: {},
    requiresCash: true,
    requiresShares: false,
  },
  sell: {
    id: 'sell',
    name: '매도',
    description: '보유 주식을 전량 매도한다.',
    rarity: 'common',
    effect: {},
    requiresCash: false,
    requiresShares: true,
  },
  partial_sell: {
    id: 'partial_sell',
    name: '분할 매도',
    description: '보유 주식의 50%를 현재가로 매도한다.',
    rarity: 'common',
    effect: {},
    requiresCash: false,
    requiresShares: true,
  },
  average_down: {
    id: 'average_down',
    name: '물타기',
    description: 'P&L이 마이너스일 때만 사용 가능. 현금으로 주식을 10% 추가 구매한다.',
    rarity: 'rare',
    effect: {
      buyEfficiency: 1.1,
    },
    requiresCash: true,
    requiresShares: false,
  },
  pump: {
    id: 'pump',
    name: '작전',
    description: '세력을 동원해 다음 턴 주가를 강제로 끌어올린다.',
    rarity: 'rare',
    effect: {
      priceMultiplier: { min: 0.05, max: 0.15 },
    },
    requiresCash: false,
    requiresShares: false,
  },
  fake_news: {
    id: 'fake_news',
    name: '가짜뉴스',
    description: '루머를 유포해 다음 턴 변동성을 2.5배로 폭발시킨다.',
    rarity: 'rare',
    effect: {
      volatilityMultiplier: 2.5,
    },
    requiresCash: false,
    requiresShares: false,
  },
  insider: {
    id: 'insider',
    name: '내부자 정보',
    description: '다음 턴 주가 등락 방향을 미리 확인한다.',
    rarity: 'legendary',
    effect: {
      revealNextPrice: true,
    },
    requiresCash: false,
    requiresShares: false,
  },
  leverage: {
    id: 'leverage',
    name: '레버리지',
    description: '현금의 2배 규모로 주식을 매수한다. 손실도 2배.',
    rarity: 'legendary',
    effect: {
      leverageMultiplier: 2,
    },
    requiresCash: true,
    requiresShares: false,
  },
};

// 초기 덱 (기본 카드만)
export const INITIAL_DECK: CardId[] = [
  'buy', 'buy', 'buy',
  'partial_buy', 'partial_buy', 'partial_buy',
  'sell', 'sell', 'sell',
  'partial_sell', 'partial_sell', 'partial_sell',
  'average_down', 'average_down',
  'pump', 'pump',
  'fake_news', 'fake_news',
];

// 손패 크기
export const HAND_SIZE = 5;

export const BASE_VOLATILITY = 0.06;
export const PRICE_BIAS = 0.015; // 매일 +1.5% 상승 편향
export const INITIAL_PRICE = 100; // 주당 $100으로 시작

export type PriceDirection = 'up' | 'down' | 'flat';

// 핵심 공식: Price_new = Price_old × (1 + Volatility × Random(-1, 1) + forcedDelta)
export function calcNextPrice(
  currentPrice: number,
  volatility: number,
  forcedDelta: number = 0,
): number {
  const random = Math.random() * 2 - 1; // -1 ~ +1
  const change = volatility * random + PRICE_BIAS + forcedDelta;
  const nextPrice = currentPrice * (1 + change);
  return Math.max(nextPrice, 1); // 최소 $1 (완전 0 방지)
}

// 다음 턴 가격 방향 미리 계산 (내부자 정보 카드용)
export function peekNextDirection(
  currentPrice: number,
  volatility: number,
  forcedDelta: number = 0,
): PriceDirection {
  // 강제 델타가 있으면 그걸로 방향 결정
  if (forcedDelta > 0.05) return 'up';
  if (forcedDelta < -0.05) return 'down';

  // 아니면 변동성 기반으로 방향 확률 계산
  // 양수 영역 = volatility 기준으로 up 확률 추정
  const upBias = forcedDelta / volatility; // -1 ~ +1 범위
  const upProbability = (upBias + 1) / 2; // 0 ~ 1 범위
  return Math.random() < upProbability ? 'up' : 'down';
}

// 과거 주가 히스토리로부터 차트용 데이터 정규화 (0~1)
export function normalizePrices(prices: number[]): number[] {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (max === min) return prices.map(() => 0.5);
  return prices.map((p) => (p - min) / (max - min));
}

// 수익률 계산
export function calcReturnRate(from: number, to: number): number {
  return (to - from) / from;
}

// 포맷 헬퍼
export function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(2)}K`;
  return `$${price.toFixed(0)}`;
}

export function formatPercent(rate: number): string {
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${(rate * 100).toFixed(1)}%`;
}

// 게임 엔진 상수 및 유틸리티
// 핵심 로직은 gameStore.ts에 위치

export { INITIAL_CASH, MODE_CONFIG } from '../store/gameStore';

// 카드 희귀도 색상
export const RARITY_COLORS = {
  common: '#AAAAAA',
  rare: '#00d97e',
  legendary: '#FFD700',
} as const;

// 카드 희귀도 라벨
export const RARITY_LABELS = {
  common: 'COMMON',
  rare: 'RARE',
  legendary: 'LEGENDARY',
} as const;

// 업그레이드 풀 (턴 종료 후 제공할 카드 선택지)
import { CardId } from './cards';

export const UPGRADE_POOL: CardId[] = [
  'pump',
  'short',
  'fake_news',
  'insider',
  'leverage',
];

export function getRandomUpgradeChoices(count = 3): CardId[] {
  const shuffled = [...UPGRADE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

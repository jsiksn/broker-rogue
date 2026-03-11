import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../game/cards';
import { RARITY_LABELS } from '../game/engine';

type Props = {
  card: Card;
  onPress: () => void;
  disabled?: boolean;
  isTop?: boolean;
  isDark?: boolean;
};

const CARD_ICONS: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  buy:          'trending-up',
  partial_buy:  'plus-circle',
  sell:         'trending-down',
  partial_sell: 'scissors',
  average_down: 'droplet',
  pump:         'zap',
  fake_news:    'file-text',
  insider:      'eye',
  leverage:     'layers',
};

const CARD_COLORS: Record<string, { bg: string; lightBg: string; accent: string }> = {
  buy:          { bg: '#0a2318', lightBg: '#ffffff', accent: '#00d97e' },
  partial_buy:  { bg: '#0a2318', lightBg: '#ffffff', accent: '#00bb6e' },
  sell:         { bg: '#230a0a', lightBg: '#ffffff', accent: '#FF4444' },
  partial_sell: { bg: '#1a0f00', lightBg: '#ffffff', accent: '#FF7744' },
  average_down: { bg: '#001a10', lightBg: '#ffffff', accent: '#44DDAA' },
  pump:         { bg: '#2a1800', lightBg: '#ffffff', accent: '#FFA500' },
  fake_news:    { bg: '#00162a', lightBg: '#ffffff', accent: '#44AAFF' },
  insider:      { bg: '#00082a', lightBg: '#ffffff', accent: '#6677FF' },
  leverage:     { bg: '#2a1f00', lightBg: '#ffffff', accent: '#FFD700' },
};

const CARD_SUBTITLES: Record<string, string> = {
  buy: 'Long Position',
  partial_buy: 'Half Entry',
  sell: 'Exit Position',
  partial_sell: 'Half Exit',
  average_down: 'Buy The Dip',
  pump: 'Market Move',
  fake_news: 'Rumor Mill',
  insider: 'Intel Access',
  leverage: 'Margin Trade',
};

export default function TradingCard({ card, onPress, disabled, isTop, isDark = true }: Props) {
  const colors = CARD_COLORS[card.id] ?? { bg: '#111111', lightBg: '#f5f5f5', accent: '#AAAAAA' };
  const cardBg = isDark ? colors.bg : colors.lightBg;
  const textColor = isDark ? '#FFFFFF' : '#0d1117';
  const subtitleColor = isDark ? '#888888' : '#718096';
  const rarityLabel = RARITY_LABELS[card.rarity];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: cardBg, borderColor: colors.accent + '44' },
        isTop && styles.cardTop,
        pressed && styles.cardPressed,
        disabled && styles.cardDisabled,
      ]}
    >
      {/* 상단: 희귀도 뱃지 */}
      <View style={styles.topRow}>
        <View style={[styles.rarityBadge, { borderColor: colors.accent + '66' }]}>
          <Feather name={CARD_ICONS[card.id] ?? 'help-circle'} size={9} color={colors.accent} />
          <Text style={[styles.rarityText, { color: colors.accent }]}>{rarityLabel}</Text>
        </View>
      </View>

      {/* 카드 이름 + 서브타이틀 */}
      <Text style={[styles.name, { color: textColor }]}>{card.name}</Text>
      <Text style={[styles.subtitle, { color: subtitleColor }]}>{CARD_SUBTITLES[card.id]}</Text>

      {/* 효과 태그 */}
      <View style={styles.bottomRow}>
        <View style={[styles.effectTag, { backgroundColor: colors.accent + '22' }]}>
          <Text style={[styles.effectText, { color: colors.accent }]}>
            {getEffectLabel(card.id)}
          </Text>
        </View>
      </View>

      {/* 액센트 사이드 바 */}
      <View style={[styles.sideBar, { backgroundColor: colors.accent }]} />

      {/* 비활성화 오버레이 */}
      {disabled && <View style={[styles.disabledOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.65)' }]} />}
    </Pressable>
  );
}

function getEffectLabel(id: string): string {
  const map: Record<string, string> = {
    buy:       '전량 매수',
    partial_buy: '50% 매수',
    sell:      '전량 매도',
    partial_sell: '50% 매도',
    average_down: '효율 ×1.1',
    pump:      '+0~10%',
    fake_news: '변동성 ×2.5',
    insider:   '방향 예측',
    leverage:  '2× 레버리지',
  };
  return map[id] ?? '-';
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardTop: {
    shadowColor: '#00d97e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  cardDisabled: {},
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  rarityText: {
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  subtitle: {
    color: '#888888',
    fontSize: 10,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 6,
  },
  effectTag: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  effectText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sideBar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../game/cards';

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

const RARITY_STARS: Record<string, string> = {
  common:    '★',
  rare:      '★★',
  legendary: '★★★',
};

const CARD_COLORS: Record<string, { gradient: [string, string]; lightGradient: [string, string]; accent: string; lightAccent: string }> = {
  buy:          { gradient: ['#0f3d25', '#0a2318'], lightGradient: ['#3B82F6', '#1D4ED8'], accent: '#00d97e', lightAccent: '#1D4ED8' },
  partial_buy:  { gradient: ['#152252', '#0d1a3a'], lightGradient: ['#A78BFA', '#7C3AED'], accent: '#60A5FA', lightAccent: '#7C3AED' },
  sell:         { gradient: ['#3a1212', '#230a0a'], lightGradient: ['#F87171', '#DC2626'], accent: '#FF4444', lightAccent: '#DC2626' },
  partial_sell: { gradient: ['#3d2600', '#2a1a00'], lightGradient: ['#FCD34D', '#D97706'], accent: '#FBBF24', lightAccent: '#D97706' },
  average_down: { gradient: ['#00261a', '#001a10'], lightGradient: ['#34D399', '#059669'], accent: '#34D399', lightAccent: '#059669' },
  pump:         { gradient: ['#3d2200', '#2a1800'], lightGradient: ['#FB923C', '#F59E0B'], accent: '#FFA500', lightAccent: '#EA580C' },
  fake_news:    { gradient: ['#00213d', '#00162a'], lightGradient: ['#C084FC', '#9333EA'], accent: '#44AAFF', lightAccent: '#9333EA' },
  insider:      { gradient: ['#000e3d', '#00082a'], lightGradient: ['#818CF8', '#4338CA'], accent: '#6677FF', lightAccent: '#4338CA' },
  leverage:     { gradient: ['#3d2f00', '#2a1f00'], lightGradient: ['#FDE68A', '#CA8A04'], accent: '#FFD700', lightAccent: '#CA8A04' },
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
  const colors = CARD_COLORS[card.id] ?? { gradient: ['#111111', '#222222'] as [string,string], lightGradient: ['#555555', '#777777'] as [string,string], accent: '#AAAAAA', lightAccent: '#888888' };
  const topGradient = isDark ? colors.gradient : colors.lightGradient;
  const accent = isDark ? colors.accent : colors.lightAccent;
  const stars = RARITY_STARS[card.rarity] ?? '★';

  // 하단 텍스트 영역 (다크모드: 어두운 배경, 라이트모드: 흰색)
  const bottomBg = isDark ? '#0d1117' : '#FFFFFF';
  const nameColor = isDark ? '#FFFFFF' : '#1A202C';
  const subtitleColor = isDark ? '#8896a7' : '#718096';

  const topSection = (
    <LinearGradient
      colors={topGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.topSection}
    >
      <Text style={[styles.stars, { color: 'rgba(255,255,255,0.9)' }]}>{stars}</Text>
      <View style={styles.iconWrap}>
        <Feather name={CARD_ICONS[card.id] ?? 'help-circle'} size={28} color="#FFFFFF" />
      </View>
    </LinearGradient>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        { borderColor: accent + '55' },
        !isDark && styles.cardLight,
        isTop && { ...styles.cardTop, shadowColor: accent },
        pressed && styles.cardPressed,
      ]}
    >
      {topSection}

      {/* 하단: 텍스트 영역 */}
      <View style={[styles.bottomSection, { backgroundColor: bottomBg }]}>
        <Text style={[styles.name, { color: nameColor }]}>{card.name}</Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>{CARD_SUBTITLES[card.id]}</Text>
        <View style={[styles.effectTag, { backgroundColor: accent + '22' }]}>
          <Text style={[styles.effectText, { color: accent }]}>{getEffectLabel(card.id)}</Text>
        </View>
      </View>

      {/* 비활성화 오버레이 */}
      {disabled && (
        <View style={[styles.disabledOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.72)' }]} />
      )}
    </Pressable>
  );
}

function getEffectLabel(id: string): string {
  const map: Record<string, string> = {
    buy:          '전량 매수',
    partial_buy:  '50% 매수',
    sell:         '전량 매도',
    partial_sell: '50% 매도',
    average_down: '효율 ×1.1',
    pump:         '+0~10%',
    fake_news:    '변동성 ×2.5',
    insider:      '방향 예측',
    leverage:     '2× 레버리지',
  };
  return map[id] ?? '-';
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTop: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  cardPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  topSection: {
    flex: 1,
    padding: 10,
    paddingBottom: 8,
  },
  stars: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  iconWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 8,
    gap: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontFamily: 'Fredoka_600SemiBold',
  },
  subtitle: {
    fontSize: 8,
    marginBottom: 4,
  },
  effectTag: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  effectText: {
    fontSize: 8,
    fontWeight: '700',
  },
});

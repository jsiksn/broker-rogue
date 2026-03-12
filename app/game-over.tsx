import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore, MODE_CONFIG, INITIAL_CASH } from '../src/store/gameStore';
import { formatPrice, formatPercent } from '../src/game/market';

export default function GameOverScreen() {
  const router = useRouter();
  const { status, day, cash, shares, currentPrice, peakAssets, mode } = useGameStore();
  const { totalDays, winGoal } = MODE_CONFIG[mode];

  const totalAssets = cash + shares * currentPrice;
  const totalReturn = (totalAssets - INITIAL_CASH) / INITIAL_CASH;
  const isWin = status === 'win';
  const isBankrupt = !isWin && totalAssets < 10;

  const gradientColors: [string, string] = isWin
    ? ['#059669', '#2563EB']
    : ['#7f1d1d', '#1e1b4b'];

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.statusLabel}>
          {isWin ? 'VICTORY' : 'GAME OVER'}
        </Text>
        <Text style={styles.result}>{isWin ? '목표 달성' : isBankrupt ? '파산' : '목표 미달'}</Text>
        <Text style={styles.subtitle}>
          {isWin
            ? `${day - 1}일 만에 목표 달성!`
            : day > totalDays
            ? `${totalDays}일을 버텼지만 목표 미달.`
            : `Day ${day - 1}에 자산이 바닥났습니다.`}
        </Text>
      </LinearGradient>

      {/* 스탯 */}
      <View style={styles.body}>
        <View style={styles.statsCard}>
          <StatRow label="생존 일수" value={`Day ${Math.min(day - 1, totalDays)}`} />
          <StatRow
            label="최종 자산"
            value={formatPrice(totalAssets)}
            valueColor={totalAssets >= winGoal ? '#059669' : '#DC2626'}
          />
          <StatRow label="최고 자산" value={formatPrice(peakAssets)} />
          <StatRow
            label="총 수익률"
            value={formatPercent(totalReturn)}
            valueColor={totalReturn >= 0 ? '#059669' : '#DC2626'}
          />
          <StatRow label="목표 금액" value={formatPrice(winGoal)} isLast />
        </View>

        <Pressable
          style={({ pressed }) => [styles.mainButton, pressed && styles.buttonPressed]}
          onPress={() => router.replace('/')}
        >
          <LinearGradient
            colors={['#059669', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainButtonGradient}
          >
            <Text style={styles.mainButtonText}>MAIN MENU</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function StatRow({ label, value, valueColor, isLast }: {
  label: string;
  value: string;
  valueColor?: string;
  isLast?: boolean;
}) {
  return (
    <View style={[statStyles.row, isLast && { borderBottomWidth: 0 }]}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 80,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  statusLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    letterSpacing: 4,
    fontWeight: '700',
    marginBottom: 12,
  },
  result: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 52,
    marginBottom: 8,
    fontFamily: 'Fredoka_700Bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Fredoka_700Bold',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    gap: 16,
    justifyContent: 'flex-end',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  mainButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  mainButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 4,
    fontFamily: 'Fredoka_700Bold',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

const statStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    color: '#718096',
    fontSize: 13,
    fontFamily: 'Fredoka_700Bold',
  },
  value: {
    color: '#1A202C',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Fredoka_700Bold',
  },
});

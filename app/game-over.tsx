import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGameStore, TOTAL_DAYS, WIN_GOAL, INITIAL_CASH } from '../src/store/gameStore';
import { formatPrice, formatPercent } from '../src/game/market';

export default function GameOverScreen() {
  const router = useRouter();
  const { status, day, cash, shares, currentPrice, peakAssets, startGame } = useGameStore();

  const totalAssets = cash + shares * currentPrice;
  const totalReturn = (totalAssets - INITIAL_CASH) / INITIAL_CASH;
  const isWin = status === 'win';

  const handleRetry = () => {
    startGame();
    router.replace('/game');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.statusLabel, { color: isWin ? '#00d97e' : '#FF2D2D' }]}>
          {isWin ? 'VICTORY' : 'GAME OVER'}
        </Text>
        <Text style={styles.result}>{isWin ? '성공' : '파산'}</Text>
        <Text style={styles.subtitle}>
          {isWin
            ? `${day - 1}일 만에 목표 달성!`
            : day > TOTAL_DAYS
            ? '20일을 버텼지만 목표 미달.'
            : `Day ${day - 1}에 자산이 바닥났습니다.`}
        </Text>

        <View style={styles.statsBox}>
          <StatRow
            label="생존 일수"
            value={`Day ${Math.min(day - 1, TOTAL_DAYS)}`}
          />
          <StatRow
            label="최종 자산"
            value={formatPrice(totalAssets)}
            valueColor={totalAssets >= WIN_GOAL ? '#00d97e' : '#FFFFFF'}
          />
          <StatRow
            label="최고 자산"
            value={formatPrice(peakAssets)}
          />
          <StatRow
            label="총 수익률"
            value={formatPercent(totalReturn)}
            valueColor={totalReturn >= 0 ? '#00d97e' : '#FF2D2D'}
          />
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: isWin ? '#00d97e' : '#FF2D2D' },
            pressed && styles.buttonPressed,
          ]}
          onPress={handleRetry}
        >
          <Text style={[styles.primaryButtonText, { color: isWin ? '#000000' : '#FFFFFF' }]}>
            RETRY
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.secondaryButtonText}>MAIN MENU</Text>
        </Pressable>
      </View>
    </View>
  );
}

function StatRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={statStyles.row}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 11,
    letterSpacing: 6,
    fontWeight: '700',
    marginBottom: 16,
  },
  result: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -2,
    marginBottom: 8,
  },
  subtitle: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 48,
  },
  statsBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  buttonGroup: {
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 18,
    borderRadius: 4,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#333333',
    paddingVertical: 18,
    borderRadius: 4,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#AAAAAA',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});

const statStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#0f0f0f',
    backgroundColor: '#050505',
  },
  label: {
    color: '#888888',
    fontSize: 13,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

export default function TitleScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 헤더 그라데이션 */}
      <LinearGradient
        colors={['#059669', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.subtitle}>ROGUE TRADER SIMULATOR</Text>
        <Text style={styles.title}>Broker</Text>
        <Text style={styles.titleAccent}>Rogue</Text>
        <Text style={styles.tagline}>합법과 불법을 넘나드는 20일 생존기</Text>
      </LinearGradient>

      {/* 본문 */}
      <View style={styles.body}>
        {/* 스탯 카드 */}
        <View style={styles.statsRow}>
          <StatCard icon="calendar" value="20" label="DAYS" />
          <StatCard icon="dollar-sign" value="$10K" label="START" />
          <StatCard icon="target" value="$100K" label="GOAL" />
        </View>

        {/* 카드 미리보기 힌트 */}
        <View style={styles.hintCard}>
          <Feather name="zap" size={14} color="#F59E0B" />
          <Text style={styles.hintText}>트레이딩 카드로 시장을 지배하라</Text>
        </View>

        {/* NEW GAME 버튼 */}
        <Pressable
          style={({ pressed }) => [styles.startButton, pressed && styles.buttonPressed]}
          onPress={() => router.push('/game')}
        >
          <LinearGradient
            colors={['#F59E0B', '#EA580C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.startGradient}
          >
            <Text style={styles.startButtonText}>NEW GAME  →</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.disclaimer}>
          * 이 게임은 불법 주식 거래를 조장하지 않습니다.
        </Text>
      </View>
    </View>
  );
}

function StatCard({ icon, value, label }: { icon: React.ComponentProps<typeof Feather>['name']; value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Feather name={icon} size={16} color="#059669" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    letterSpacing: 4,
    fontWeight: '600',
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 58,
    letterSpacing: -2,
  },
  titleAccent: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 58,
    letterSpacing: -2,
    marginBottom: 16,
  },
  tagline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    gap: 16,
    justifyContent: 'flex-end',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  statValue: {
    color: '#1A202C',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: '#718096',
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '700',
  },
  hintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  hintText: {
    color: '#1A202C',
    fontSize: 13,
    fontWeight: '600',
  },
  startButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 4,
  },
  disclaimer: {
    color: '#A0AEC0',
    fontSize: 11,
    textAlign: 'center',
  },
});

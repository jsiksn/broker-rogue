import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function TitleScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>ROGUE TRADER SIMULATOR</Text>
        <Text style={styles.title}>BROKER</Text>
        <Text style={styles.titleAccent}>ROGUE</Text>
        <Text style={styles.tagline}>합법과 불법을 넘나드는 20일 생존기</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>20</Text>
          <Text style={styles.statLabel}>DAYS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>$10K</Text>
          <Text style={styles.statLabel}>START</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>$100K</Text>
          <Text style={styles.statLabel}>GOAL</Text>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <Pressable
          style={({ pressed }) => [styles.startButton, pressed && styles.buttonPressed]}
          onPress={() => router.push('/game')}
        >
          <Text style={styles.startButtonText}>NEW GAME</Text>
        </Pressable>
      </View>

      <Text style={styles.disclaimer}>
        * 이 게임은 불법 주식 거래를 조장하지 않습니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'flex-start',
  },
  subtitle: {
    color: '#00d97e',
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '900',
    lineHeight: 64,
    letterSpacing: -2,
  },
  titleAccent: {
    color: '#00d97e',
    fontSize: 64,
    fontWeight: '900',
    lineHeight: 64,
    letterSpacing: -2,
    marginBottom: 16,
  },
  tagline: {
    color: '#aaaaaa',
    fontSize: 13,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#0a0a0a',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1a1a1a',
  },
  statValue: {
    color: '#00d97e',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -1,
  },
  statLabel: {
    color: '#888888',
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 4,
  },
  buttonGroup: {
    gap: 12,
  },
  startButton: {
    backgroundColor: '#00d97e',
    paddingVertical: 18,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  startButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
  },
  disclaimer: {
    color: '#666666',
    fontSize: 11,
    textAlign: 'center',
  },
});

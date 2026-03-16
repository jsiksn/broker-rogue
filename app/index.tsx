import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useGameStore, GameMode, MODE_CONFIG } from '../src/store/gameStore';

export default function TitleScreen() {
  const router = useRouter();
  const startGame = useGameStore(s => s.startGame);

  const handleStart = (mode: GameMode) => {
    startGame(mode);
    router.push('/game');
  };

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
        <Text style={styles.tagline}>합법과 불법을 넘나드는 주식 생존기</Text>
      </LinearGradient>

      {/* 본문 */}
      <View style={styles.body}>
        <Text style={styles.modeLabel}>모드 선택</Text>

        {/* Retail (개미) */}
        <Pressable
          style={({ pressed }) => [styles.modeButton, pressed && styles.buttonPressed]}
          onPress={() => handleStart('retail')}
        >
          <LinearGradient
            colors={['#F59E0B', '#EA580C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modeGradient}
          >
            <View style={styles.modeTop}>
              <Text style={styles.modeName}>Retail</Text>
              <Text style={styles.modeKorean}>개미</Text>
            </View>
            <View style={styles.modeMeta}>
              <View style={styles.modeStatRow}>
                <Feather name="calendar" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.modeStatText}>{MODE_CONFIG.retail.totalDays}일</Text>
              </View>
              <View style={styles.modeStatRow}>
                <Feather name="target" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.modeStatText}>${(MODE_CONFIG.retail.winGoal / 1000).toFixed(0)}K 목표</Text>
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Cartel (세력) */}
        <Pressable
          style={({ pressed }) => [styles.modeButton, pressed && styles.buttonPressed]}
          onPress={() => handleStart('cartel')}
        >
          <LinearGradient
            colors={['#7C3AED', '#4338CA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modeGradient}
          >
            <View style={styles.modeTop}>
              <Text style={styles.modeName}>Cartel</Text>
              <Text style={styles.modeKorean}>세력</Text>
            </View>
            <View style={styles.modeMeta}>
              <View style={styles.modeStatRow}>
                <Feather name="calendar" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.modeStatText}>{MODE_CONFIG.cartel.totalDays}일</Text>
              </View>
              <View style={styles.modeStatRow}>
                <Feather name="target" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.modeStatText}>${(MODE_CONFIG.cartel.winGoal / 1000).toFixed(0)}K 목표</Text>
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        <Text style={styles.disclaimer}>
          * 이 게임은 불법 주식 거래를 조장하지 않습니다.
        </Text>
      </View>
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
    fontFamily: 'Fredoka_600SemiBold',
  },
  titleAccent: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 58,
    letterSpacing: -2,
    marginBottom: 16,
    fontFamily: 'Fredoka_600SemiBold',
  },
  tagline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    letterSpacing: 0.5,
    fontFamily: 'Fredoka_600SemiBold',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    gap: 12,
    justifyContent: 'flex-end',
  },
  modeLabel: {
    color: '#718096',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
  },
  modeButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modeGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  modeTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 10,
  },
  modeName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontFamily: 'Fredoka_600SemiBold',
  },
  modeKorean: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Fredoka_600SemiBold',
  },
  modeMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  modeStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  modeStatText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disclaimer: {
    color: '#A0AEC0',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Alert, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

function confirm(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: '취소', style: 'cancel' },
      { text: '확인', onPress: onConfirm },
    ]);
  }
}
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore, MODE_CONFIG } from '../src/store/gameStore';
import StockChart from '../src/components/StockChart';
import PortfolioCard from '../src/components/PortfolioCard';
import CardFan from '../src/components/CardFan';
import { formatPrice, formatPercent } from '../src/game/market';

export default function GameScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const initialized = useRef(false);

  const state = useGameStore();
  const { startGame, playCard, endTurn, setCurrentPrice, status, day, cash, shares, currentPrice, priceHistory, hand, nextPriceDirection, pending, mode, volatility, priceBias } = state;
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(false);

  // 시장 시간: 96틱 = 8:00~16:00 (1틱 = 5분)
  const MARKET_TICKS = 96;
  const initPrices = (p: number) => new Array(MARKET_TICKS).fill(p);
  const [livePrices, setLivePrices] = useState<number[]>(() => initPrices(currentPrice));
  const livePricesRef = useRef(livePrices);
  const [marketTick, setMarketTick] = useState(0);
  const marketTickRef = useRef(0);
  const appliedDeltaRef = useRef(0);
  const pumpAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const volatilityRef = useRef(volatility);
  useEffect(() => { volatilityRef.current = volatility; }, [volatility]);
  const priceBiasRef = useRef(priceBias);
  useEffect(() => { priceBiasRef.current = priceBias; }, [priceBias]);

  useEffect(() => {
    if (!initialized.current) { initialized.current = true; if (status !== 'playing') startGame('cartel'); }
  }, []);

  useEffect(() => {
    if (status === 'win' || status === 'lose') router.replace('/game-over');
  }, [status]);

  // 날이 바뀌면 차트 리셋
  useEffect(() => {
    if (pumpAnimRef.current) { clearInterval(pumpAnimRef.current); pumpAnimRef.current = null; }
    const p = priceHistory[priceHistory.length - 1] ?? currentPrice;
    const reset = initPrices(p);
    livePricesRef.current = reset;
    marketTickRef.current = 0;
    appliedDeltaRef.current = 0;
    setLivePrices(reset);
    setMarketTick(0);
  }, [priceHistory]);

  // 카드 효과: pump 3~8초 우상향 후 원가 복귀
  useEffect(() => {
    const newDelta = pending.forcedDelta - appliedDeltaRef.current;
    if (newDelta === 0) return;
    appliedDeltaRef.current = pending.forcedDelta;

    const tick = marketTickRef.current;
    const basePrice = livePricesRef.current[tick];

    {
      if (pumpAnimRef.current) clearInterval(pumpAnimRef.current);
      const peakPrice = Math.max(basePrice * (1 + newDelta), 100);
      const riseMs = 3000 + Math.random() * 5000;
      const fallMs = Math.random() * 5000;
      const stepMs = 50;
      let riseElapsed = 0;
      let fallElapsed = 0;
      let phase: 'rise' | 'fall' = 'rise';

      pumpAnimRef.current = setInterval(() => {
        let animPrice: number;
        if (phase === 'rise') {
          riseElapsed += stepMs;
          const t = Math.min(riseElapsed / riseMs, 1);
          animPrice = basePrice + (peakPrice - basePrice) * (1 - Math.pow(1 - t, 2));
          if (riseElapsed >= riseMs) phase = 'fall';
        } else {
          fallElapsed += stepMs;
          const t = fallMs > 0 ? Math.min(fallElapsed / fallMs, 1) : 1;
          animPrice = peakPrice + (basePrice - peakPrice) * t;
          if (fallElapsed >= fallMs || fallMs === 0) {
            clearInterval(pumpAnimRef.current!);
            pumpAnimRef.current = null;
            animPrice = basePrice;
          }
        }
        const cur = marketTickRef.current;
        const newPrices = [...livePricesRef.current];
        for (let i = cur; i < MARKET_TICKS; i++) newPrices[i] = animPrice;
        livePricesRef.current = newPrices;
        setLivePrices(newPrices);
        setCurrentPrice(animPrice);
      }, stepMs);
    }
  }, [pending.forcedDelta]);

  // 실시간 틱: 500ms마다 1틱 진행
  useEffect(() => {
    const id = setInterval(() => {
      const prev = marketTickRef.current;
      if (prev >= MARKET_TICKS - 1) return;
      const next = prev + 1;
      const last = livePricesRef.current[prev];
      const tickAmp = volatilityRef.current / MARKET_TICKS;
      const tickBias = priceBiasRef.current / MARKET_TICKS;
      const noise = last * (Math.random() * 2 * tickAmp - tickAmp + tickBias);
      const newPrice = Math.max(last + noise, 1);
      const newPrices = [...livePricesRef.current];
      for (let i = next; i < MARKET_TICKS; i++) newPrices[i] = newPrice;
      livePricesRef.current = newPrices;
      marketTickRef.current = next;
      setLivePrices(newPrices);
      setMarketTick(next);
      setCurrentPrice(newPrice);
    }, 500);
    return () => clearInterval(id);
  }, [priceHistory]);

  const theme = isDark
    ? { bg: '#0d1117', cardBg: '#1a2030', border: '#2e3f5c', text: '#FFFFFF', muted: '#8896a7' }
    : { bg: '#F8FAFC', cardBg: '#FFFFFF', border: '#E2E8F0', text: '#1A202C', muted: '#718096' };

  // 시장 시각 계산 (8:00 ~ 16:00)
  const marketMinutes = (marketTick / (MARKET_TICKS - 1)) * 480;
  const mHour = Math.floor(8 + marketMinutes / 60);
  const mMin = Math.floor(marketMinutes % 60);
  const currentTime = `${String(mHour).padStart(2, '0')}:${String(mMin).padStart(2, '0')}`;
  const todayOpen = priceHistory[priceHistory.length - 1] ?? currentPrice;
  const dayChangeRate = todayOpen > 0 ? (currentPrice - todayOpen) / todayOpen : 0;
  const isUp = dayChangeRate >= 0;
  const accent = isUp ? '#00d97e' : '#FF2D2D';

  return (
    <Pressable style={[styles.container, { backgroundColor: theme.bg }]} onPress={() => setSelectedCard(null)}>
      {/* 헤더 */}
      <LinearGradient colors={isDark ? ['#064e3b', '#1e3a8a'] : ['#059669', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <Text style={styles.gameTitle}>Broker Rogue</Text>
        <View style={styles.dayBadge}>
          <View style={[styles.dayDot, { backgroundColor: accent }]} />
          <Text style={styles.dayText}>Day {day}/{MODE_CONFIG[mode].totalDays}</Text>
        </View>
        <View style={styles.headerIcons}>
          <Pressable onPress={() => setIsDark(d => !d)}>
            <Feather name={isDark ? 'sun' : 'moon'} size={17} color="#94A3B8" />
          </Pressable>
          <Pressable style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }} onPress={() => {
            confirm('메인 화면으로', '메인 화면으로 나가겠습니까?\n현재 진행 상황은 저장되지 않습니다.', () => router.replace('/'));
          }}>
            <Feather name="home" size={17} color="#94A3B8" />
          </Pressable>
        </View>
      </LinearGradient>

      {/* 차트 */}
      <View style={[styles.chartCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.chartRow}>
          <View style={styles.tickerRow}>
            <View>
              <Text style={[styles.ticker, { color: theme.text }]}>BRKR</Text>
              <Text style={[styles.timeLabel, { color: theme.muted }]}>{currentTime}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: accent + '22' }]}>
              <Text style={[styles.pillText, { color: accent }]}>
                {isUp ? '▲' : '▼'} {formatPercent(dayChangeRate)}
              </Text>
            </View>
          </View>
          <View style={styles.priceRight}>
            <Text style={[styles.price, { color: accent }]}>{isUp ? '▲' : '▼'} {formatPrice(currentPrice)}</Text>
            <Text style={[styles.openLabel, { color: accent }]}>
              {isUp ? '+' : ''}{formatPrice(currentPrice - todayOpen)} ({formatPercent(dayChangeRate)})
            </Text>
          </View>
        </View>
        <StockChart prices={livePrices} width={width - 48} height={70} isDark={isDark} />
      </View>

      {/* 포트폴리오 */}
      <PortfolioCard
        cash={cash}
        shares={shares}
        currentPrice={currentPrice}
        avgBuyPrice={state.avgBuyPrice}
        isDark={isDark}
        winGoal={MODE_CONFIG[mode].winGoal}
      />

      {/* 카드 */}
      <View style={styles.cardsHeader}>
        <Text style={[styles.cardsLabel, { color: theme.muted }]}>TRADE CARDS</Text>
        <Text style={styles.cardsCount}>{hand.length} cards</Text>
      </View>
      <View style={{ flex: 1, marginTop: 8 }}>
        <CardFan hand={hand} onPlayCard={(i) => playCard(i, currentPrice)} selected={selectedCard} onSelect={setSelectedCard} cash={cash} shares={shares} avgBuyPrice={state.avgBuyPrice} currentPrice={currentPrice} isMarketClosed={marketTick >= MARKET_TICKS - 1} isDark={isDark} />
      </View>

      {/* NEXT DAY */}
      <View style={styles.nextDayRow}>
        <Pressable
          style={({ pressed }) => [styles.nextDayBtn, pressed && styles.btnPressed]}
          onPress={() => {
            if (marketTick < MARKET_TICKS - 1) {
              confirm('장 마감 전', '아직 장이 마감되지 않았습니다.\n다음날로 넘어가겠습니까?', endTurn);
            } else {
              endTurn();
            }
          }}
        >
          <LinearGradient
            colors={isDark ? ['#d97706', '#c2410c'] : ['#F59E0B', '#EA580C']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.nextDayGradient}
          >
            <Text style={styles.nextDayText}>NEXT DAY</Text>
          </LinearGradient>
        </Pressable>

        {/* 효과 뱃지 */}
        {nextPriceDirection != null && (
          <View style={[styles.signalBadge, { backgroundColor: nextPriceDirection === 'up' ? '#059669' : '#DC2626' }]}>
            <Feather name={nextPriceDirection === 'up' ? 'trending-up' : 'trending-down'} size={18} color="#FFFFFF" />
          </View>
        )}
        {pending.volatilityMultiplier > 1 && (
          <View style={[styles.signalBadge, { backgroundColor: '#D97706' }]}>
            <Feather name="radio" size={18} color="#FFFFFF" />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
  },
  gameTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: -0.5, fontFamily: 'Fredoka_600SemiBold' },
  roundLabel: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  dayBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  dayDot: { width: 6, height: 6, borderRadius: 3 },
  dayText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  headerIcons: { flexDirection: 'row', gap: 12, alignItems: 'center' },

  chartCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12, gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tickerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  ticker: { fontSize: 13, fontWeight: '800', letterSpacing: 1, fontFamily: 'Fredoka_600SemiBold' },
  pill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
  pillText: { fontSize: 10, fontWeight: '700' },
  priceRight: { alignItems: 'flex-end' },
  price: { fontSize: 20, fontWeight: '900', letterSpacing: 0.75, fontFamily: 'Fredoka_600SemiBold' },
  openLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  timeLabel: { fontSize: 9, letterSpacing: 1 },
  chartDivider: { borderBottomWidth: 1 },

  cardsHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardsLabel: { fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  cardsCount: { color: '#10B981', fontSize: 10, fontWeight: '700' },

  nextDayRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  nextDayBtn: {
    flex: 1, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextDayGradient: {
    paddingVertical: 15, alignItems: 'center',
  },
  signalBadge: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  nextDayText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 4, fontFamily: 'Fredoka_600SemiBold' },
});

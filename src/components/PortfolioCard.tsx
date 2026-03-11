import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatPrice, formatPercent } from '../game/market';
import { WIN_GOAL, INITIAL_CASH } from '../store/gameStore';

type Props = {
  cash: number;
  shares: number;
  currentPrice: number;
  avgBuyPrice: number;
  nextPriceDirection: 'up' | 'down' | null;
  isDark: boolean;
};

export default function PortfolioCard({
  cash,
  shares,
  currentPrice,
  avgBuyPrice,
  nextPriceDirection,
  isDark,
}: Props) {
  const sharesValue = shares * currentPrice;
  const totalAssets = cash + sharesValue;
  const totalReturn = totalAssets - INITIAL_CASH;
  const totalReturnRate = totalReturn / INITIAL_CASH;
  const isPositive = totalReturn >= 0;
  const goalProgress = Math.min(totalAssets / WIN_GOAL, 1);

  const border = isDark ? '#2e3f5c' : 'transparent';
  const statBg = isDark ? '#1a2030' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#FFFFFF';
  const textMuted = isDark ? '#8896a7' : 'rgba(255,255,255,0.75)';
  const gainColor = isPositive ? '#A7F3D0' : '#FCA5A5';

  const gradientColors: [string, string] = isDark
    ? ['#0a2318', '#001a30']
    : ['#059669', '#2563EB'];

  return (
    <View style={styles.container}>
      {/* 메인: Total Value + GAIN 한 줄 */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.mainCard, { borderColor: border }]}
      >
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.totalLabel, { color: textMuted }]}>Total Value</Text>
            <Text style={[styles.totalValue, { color: textPrimary }]}>{formatPrice(totalAssets)}</Text>
          </View>
          <View style={[styles.gainBadge, { borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={[styles.gainText, { color: gainColor }]}>
              {isPositive ? '+' : ''}{formatPrice(totalReturn)} ({formatPercent(totalReturnRate)})
            </Text>
          </View>
        </View>
        <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <View style={[styles.progressFill, { width: `${(goalProgress * 100).toFixed(1)}%` as any }]} />
        </View>
      </LinearGradient>

      {/* 하단 stat row */}
      <View style={styles.statsRow}>
        <StatBox label="Cash" value={formatPrice(cash)} bg={statBg} border={isDark ? '#2e3f5c' : '#E2E8F0'} textPrimary={isDark ? '#FFFFFF' : '#1A202C'} textMuted={isDark ? '#8896a7' : '#718096'} />
        <StatBox
          label="Shares"
          value={shares > 0 ? formatPrice(sharesValue) : '—'}
          sub={shares > 0 ? `${shares.toFixed(4)}주` : undefined}
          subColor={isDark ? '#8896a7' : '#718096'}
          bg={statBg} border={isDark ? '#2e3f5c' : '#E2E8F0'} textPrimary={isDark ? '#FFFFFF' : '#1A202C'} textMuted={isDark ? '#8896a7' : '#718096'}
        />
        {shares > 0 && avgBuyPrice > 0 ? (
          <StatBox
            label="Avg Buy"
            value={formatPrice(avgBuyPrice)}
            bg={statBg} border={isDark ? '#2e3f5c' : '#E2E8F0'} textPrimary={isDark ? '#FFFFFF' : '#1A202C'} textMuted={isDark ? '#8896a7' : '#718096'}
          />
        ) : null}
        {shares > 0 && avgBuyPrice > 0 ? (() => {
          const pnl = sharesValue - shares * avgBuyPrice;
          const pnlRate = (currentPrice - avgBuyPrice) / avgBuyPrice;
          const color = pnl >= 0 ? '#059669' : '#DC2626';
          return (
            <StatBox
              label="P&L"
              value={`${pnl >= 0 ? '+' : ''}${formatPrice(pnl)}`}
              sub={formatPercent(pnlRate)}
              valueColor={color}
              subColor={color}
              bg={statBg} border={isDark ? '#2e3f5c' : '#E2E8F0'} textPrimary={isDark ? '#FFFFFF' : '#1A202C'} textMuted={isDark ? '#8896a7' : '#718096'}
            />
          );
        })() : null}
        {nextPriceDirection ? (
          <StatBox
            label="Signal"
            value={nextPriceDirection === 'up' ? '▲' : '▼'}
            valueColor={nextPriceDirection === 'up' ? '#059669' : '#DC2626'}
            bg={statBg} border={isDark ? '#2e3f5c' : '#E2E8F0'} textPrimary={isDark ? '#FFFFFF' : '#1A202C'} textMuted={isDark ? '#8896a7' : '#718096'}
          />
        ) : null}
      </View>
    </View>
  );
}

function StatBox({ label, value, sub, valueColor, subColor, bg, border, textPrimary, textMuted }: {
  label: string; value: string; sub?: string; valueColor?: string; subColor?: string;
  bg: string; border: string; textPrimary: string; textMuted: string;
}) {
  return (
    <View style={[statStyles.box, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[statStyles.label, { color: textMuted }]}>{label}</Text>
      <Text style={[statStyles.value, { color: valueColor ?? textPrimary }]}>{value}</Text>
      {sub && <Text style={[statStyles.sub, { color: subColor ?? textMuted }]}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  mainCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: { fontSize: 10, marginBottom: 2, letterSpacing: 0.5 },
  totalValue: { fontSize: 22, fontWeight: '900', letterSpacing: -1 },
  gainBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  gainText: { fontSize: 12, fontWeight: '700' },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A7F3D0',
    borderRadius: 2,
  },
  statsRow: { flexDirection: 'row', gap: 6 },
});

const statStyles = StyleSheet.create({
  box: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  label: { fontSize: 9, letterSpacing: 1, marginBottom: 2 },
  value: { fontSize: 12, fontWeight: '700' },
  sub: { fontSize: 9, fontWeight: '600', marginTop: 1 },
});

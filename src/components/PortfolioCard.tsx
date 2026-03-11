import { StyleSheet, Text, View } from 'react-native';
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
  const gainColor = isPositive ? '#00d97e' : '#FF2D2D';

  const cardBg = isDark ? '#13171f' : '#ffffff';
  const border = isDark ? '#1e2533' : '#d1d9e0';
  const statBg = isDark ? '#0d1117' : '#ffffff';
  const textPrimary = isDark ? '#FFFFFF' : '#0d1117';
  const textMuted = isDark ? '#8896a7' : '#718096';

  return (
    <View style={styles.container}>
      {/* 메인: Total Value + GAIN 한 줄 */}
      <View style={[styles.mainCard, { backgroundColor: cardBg, borderColor: border }]}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.totalLabel, { color: textMuted }]}>Total Value</Text>
            <Text style={[styles.totalValue, { color: textPrimary }]}>{formatPrice(totalAssets)}</Text>
          </View>
          <View style={[styles.gainBadge, { borderColor: gainColor + '33', backgroundColor: gainColor + '18' }]}>
            <Text style={[styles.gainText, { color: gainColor }]}>
              {isPositive ? '+' : ''}{formatPrice(totalReturn)} ({formatPercent(totalReturnRate)})
            </Text>
          </View>
        </View>
        <View style={[styles.progressBar, { backgroundColor: border }]}>
          <View style={[styles.progressFill, { width: `${(goalProgress * 100).toFixed(1)}%` as any }]} />
        </View>
      </View>

      {/* 하단 stat row */}
      <View style={styles.statsRow}>
        <StatBox label="Cash" value={formatPrice(cash)} bg={statBg} border={border} textPrimary={textPrimary} textMuted={textMuted} />
        <StatBox
          label="Shares"
          value={shares > 0 ? formatPrice(sharesValue) : '—'}
          sub={shares > 0 ? `${shares.toFixed(4)}주` : undefined}
          subColor={textMuted}
          bg={statBg} border={border} textPrimary={textPrimary} textMuted={textMuted}
        />
        {shares > 0 && avgBuyPrice > 0 ? (
          <StatBox
            label="Avg Buy"
            value={formatPrice(avgBuyPrice)}
            bg={statBg} border={border} textPrimary={textPrimary} textMuted={textMuted}
          />
        ) : null}
        {shares > 0 && avgBuyPrice > 0 ? (() => {
          const pnl = sharesValue - shares * avgBuyPrice;
          const pnlRate = (currentPrice - avgBuyPrice) / avgBuyPrice;
          const color = pnl >= 0 ? '#00d97e' : '#FF2D2D';
          return (
            <StatBox
              label="P&L"
              value={`${pnl >= 0 ? '+' : ''}${formatPrice(pnl)}`}
              sub={formatPercent(pnlRate)}
              valueColor={color}
              subColor={color}
              bg={statBg} border={border} textPrimary={textPrimary} textMuted={textMuted}
            />
          );
        })() : null}
        {nextPriceDirection ? (
          <StatBox
            label="Signal"
            value={nextPriceDirection === 'up' ? '▲' : '▼'}
            valueColor={nextPriceDirection === 'up' ? '#00d97e' : '#FF2D2D'}
            bg={statBg} border={border} textPrimary={textPrimary} textMuted={textMuted}
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
  container: { gap: 6 },
  mainCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: { fontSize: 10, marginBottom: 2 },
  totalValue: { fontSize: 22, fontWeight: '900', letterSpacing: -1 },
  gainBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  gainText: { fontSize: 12, fontWeight: '700' },
  progressBar: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00d97e',
    borderRadius: 2,
  },
  statsRow: { flexDirection: 'row', gap: 6 },
});

const statStyles = StyleSheet.create({
  box: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
    padding: 8,
  },
  label: { fontSize: 9, letterSpacing: 1, marginBottom: 2 },
  value: { fontSize: 12, fontWeight: '700' },
  sub: { fontSize: 9, fontWeight: '600', marginTop: 1 },
});

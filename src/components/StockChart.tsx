import { useMemo } from 'react';
import { View } from 'react-native';
import { Path, Svg, Defs, LinearGradient, Stop } from 'react-native-svg';
import { normalizePrices } from '../game/market';

type Props = {
  prices: number[];
  width: number;
  height: number;
  isDark?: boolean;
};

export default function StockChart({ prices, width, height, isDark = true }: Props) {
  const padH = 8;
  const padV = 8;
  const chartW = width - padH * 2;
  const chartH = height - padV * 2;

  const { linePath, fillPath, isUp } = useMemo(() => {
    if (prices.length < 2) {
      return { linePath: '', fillPath: '', isUp: true };
    }

    const normalized = normalizePrices(prices);
    const step = chartW / (normalized.length - 1);

    const points = normalized.map((v, i) => ({
      x: padH + i * step,
      y: padV + chartH * (1 - v),
    }));

    const line = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');

    const fill =
      line +
      ` L${points[points.length - 1].x.toFixed(1)},${(padV + chartH).toFixed(1)}` +
      ` L${points[0].x.toFixed(1)},${(padV + chartH).toFixed(1)} Z`;

    return {
      linePath: line,
      fillPath: fill,
      isUp: prices[prices.length - 1] >= prices[0],
    };
  }, [prices, chartW, chartH]);

  const color = isUp ? '#00d97e' : '#FF2D2D';
  const gradientId = isUp ? 'greenGrad' : 'redGrad';

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.25" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {[0.25, 0.5, 0.75].map((ratio) => (
        <Path
          key={ratio}
          d={`M${padH},${(padV + chartH * ratio).toFixed(1)} L${(padH + chartW).toFixed(1)},${(padV + chartH * ratio).toFixed(1)}`}
          stroke={isDark ? '#2e3f5c' : '#e2e8f0'}
          strokeWidth="1"
        />
      ))}

      {fillPath ? <Path d={fillPath} fill={`url(#${gradientId})`} /> : null}

      {linePath ? (
        <Path
          d={linePath}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </Svg>
  );
}

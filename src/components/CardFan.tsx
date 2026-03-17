import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { CardId, CARDS } from '../game/cards';
import TradingCard from './TradingCard';

type Props = {
  hand: CardId[];
  onPlayCard: (index: number) => void;
  selected: number | null;
  onSelect: (index: number | null) => void;
  cash: number;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  isMarketClosed: boolean;
  isDark: boolean;
};

const CARD_W = 88;
const CARD_H = 125;
const SPRING = { damping: 16, stiffness: 180, mass: 0.7 };

type PlayingCard = { cardId: CardId; x: number; y: number };

export default function CardFan({ hand, onPlayCard, selected, onSelect, cash, shares, avgBuyPrice, currentPrice, isMarketClosed, isDark }: Props) {
  const { width } = useWindowDimensions();
  const [playingCard, setPlayingCard] = useState<PlayingCard | null>(null);

  useEffect(() => { onSelect(null); }, [hand]);

  if (hand.length === 0 && !playingCard) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>카드 없음</Text>
      </View>
    );
  }

  const count = hand.length;
  const overlap = Math.min(50, (width - 32) / Math.max(count, 1));
  const totalW = CARD_W + overlap * (Math.max(count, 1) - 1);
  const startX = (width - 32 - totalW) / 2;

  return (
    <View style={styles.container}>
      <View style={styles.fanArea}>
        {hand.map((cardId, i) => {
          const fanOffset = i - (count - 1) / 2;
          const rotate = fanOffset * 6;
          const arcDrop = -8 + Math.abs(fanOffset) * 6 + (fanOffset === 0 ? 4 : 0);
          const x = startX + i * overlap;
          const isSelected = selected === i;
          const isDisabled = isMarketClosed ||
            ((cardId === 'buy' || cardId === 'partial_buy' || cardId === 'leverage') ? cash <= 0 :
            (cardId === 'sell' || cardId === 'partial_sell') ? shares <= 0 :
            (cardId === 'average_down') ? (cash <= 0 || avgBuyPrice <= 0 || currentPrice >= avgBuyPrice) :
            false);

          return (
            <FanCard
              key={`${cardId}-${i}-${count}`}
              cardId={cardId}
              x={x}
              rotate={rotate}
              arcDrop={arcDrop}
              isSelected={isSelected}
              isDisabled={isDisabled}
              zIndex={isSelected ? 99 : 10 + i}
              isDark={isDark}
              onPress={() => {
                if (isDisabled) return;
                if (isSelected) {
                  onPlayCard(i);
                  setPlayingCard({ cardId, x, y: arcDrop - 18 });
                  onSelect(null);
                } else {
                  onSelect(i);
                }
              }}
            />
          );
        })}

        {playingCard && (
          <PlayingCardOverlay
            cardId={playingCard.cardId}
            x={playingCard.x}
            y={playingCard.y}
            isDark={isDark}
            onDone={() => setPlayingCard(null)}
          />
        )}
      </View>

      <Text style={[styles.hint, { color: isDark ? '#4a5568' : '#718096' }]}>
        {isMarketClosed
          ? '장이 마감되었습니다.'
          : selected !== null
          ? `[${CARDS[hand[selected]].name}] 탭 → 플레이`
          : '카드를 탭하세요'}
      </Text>
    </View>
  );
}

function PlayingCardOverlay({ cardId, x, y, isDark, onDone }: {
  cardId: CardId; x: number; y: number; isDark: boolean; onDone: () => void;
}) {
  const scale = useSharedValue(1.08);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(1.6, { duration: 160 }, () => {
      scale.value = withTiming(0, { duration: 220 });
      opacity.value = withTiming(0, { duration: 220 }, () => {
        runOnJS(onDone)();
      });
    });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: y, width: CARD_W, height: CARD_H, zIndex: 200 }, animStyle]}>
      <TradingCard card={CARDS[cardId]} onPress={() => {}} isTop isDark={isDark} />
    </Animated.View>
  );
}

function FanCard({
  cardId, x, rotate, arcDrop, isSelected, isDisabled, zIndex, isDark, onPress,
}: {
  cardId: CardId; x: number; rotate: number; arcDrop: number;
  isSelected: boolean; isDisabled: boolean; zIndex: number; isDark: boolean; onPress: () => void;
}) {
  const card = CARDS[cardId];
  const translateY = useSharedValue(arcDrop);
  const rotateVal = useSharedValue(rotate);
  const scaleVal = useSharedValue(1);

  useEffect(() => {
    translateY.value = withSpring(isSelected ? arcDrop - 18 : arcDrop, SPRING);
    rotateVal.value = withSpring(isSelected ? 0 : rotate, SPRING);
    scaleVal.value = withSpring(isSelected ? 1.08 : 1, SPRING);
  }, [isSelected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotateVal.value}deg` },
      { scale: scaleVal.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: 0,
          width: CARD_W,
          height: CARD_H,
          zIndex,
          ...(Platform.OS !== 'web' && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: isSelected ? 8 : 4 },
            shadowOpacity: isSelected ? 0.22 : 0.12,
            shadowRadius: isSelected ? 12 : 6,
            elevation: isSelected ? 10 : 4,
          }),
        },
        animStyle,
      ]}
    >
      <TradingCard card={card} onPress={onPress} isTop={isSelected} disabled={isDisabled} isDark={isDark} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 4 },
  hint: { color: '#4a5568', fontSize: 10, textAlign: 'center' },
  fanArea: { flex: 1, position: 'relative' },
  empty: { height: 80, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#4a5568', fontSize: 11 },
});

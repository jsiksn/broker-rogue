import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { CardId, CARDS } from '../game/cards';
import TradingCard from './TradingCard';

type Props = {
  hand: CardId[];
  onPlayCard: (index: number) => void;
};

const CARD_W = 90;
const CARD_H = 125;
const PEEK = 50;     // 도킹 상태에서 보이는 높이
const LIFT = 110;    // 선택 시 올라가는 높이

const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.8 };

export default function CardDock({ hand, onPlayCard }: Props) {
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState<number | null>(null);

  // 카드가 바뀌면 선택 해제
  useEffect(() => { setSelected(null); }, [hand]);

  if (hand.length === 0) return null;

  const count = hand.length;
  const spacing = Math.min(48, (width - CARD_W - 32) / Math.max(count - 1, 1));
  const totalW = CARD_W + spacing * (count - 1);
  const startX = (width - 32 - totalW) / 2;

  return (
    <>
      {/* 선택 시: 배경 탭으로 해제 */}
      {selected !== null && (
        <Pressable
          style={styles.overlay}
          onPress={() => setSelected(null)}
        />
      )}

      {/* 힌트 */}
      {selected !== null && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            [{CARDS[hand[selected]].name}] 한 번 더 탭 → 플레이
          </Text>
        </View>
      )}

      {/* 카드 도킹 영역 */}
      <View style={styles.dock} pointerEvents="box-none">
        {hand.map((cardId, i) => {
          const fanOffset = i - (count - 1) / 2;
          const rotate = fanOffset * 7;
          const arcY = Math.abs(fanOffset) * 8;
          const x = startX + i * spacing;
          const isSelected = selected === i;

          return (
            <DockCard
              key={`${cardId}-${i}-${hand.length}`}
              cardId={cardId}
              x={x}
              rotate={rotate}
              arcY={arcY}
              isSelected={isSelected}
              zIndex={isSelected ? 99 : i}
              onPress={() => {
                if (isSelected) {
                  onPlayCard(i);
                  setSelected(null);
                } else {
                  setSelected(i);
                }
              }}
            />
          );
        })}
      </View>
    </>
  );
}

function DockCard({
  cardId,
  x,
  rotate,
  arcY,
  isSelected,
  zIndex,
  onPress,
}: {
  cardId: CardId;
  x: number;
  rotate: number;
  arcY: number;
  isSelected: boolean;
  zIndex: number;
  onPress: () => void;
}) {
  const card = CARDS[cardId];
  const translateY = useSharedValue(0);
  const rotateVal = useSharedValue(rotate);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withSpring(isSelected ? -LIFT : 0, SPRING_CONFIG);
    rotateVal.value = withSpring(isSelected ? 0 : rotate, SPRING_CONFIG);
    scale.value = withSpring(isSelected ? 1.08 : 1, SPRING_CONFIG);
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value - arcY },
      { rotate: `${rotateVal.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.cardSlot,
        { left: x, width: CARD_W, height: CARD_H, zIndex },
        animatedStyle,
      ]}
    >
      <TradingCard card={card} onPress={onPress} isTop={isSelected} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  hintContainer: {
    position: 'absolute',
    bottom: PEEK + LIFT - 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 98,
  },
  hintText: {
    color: '#00d97e',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#13171f',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e2533',
    overflow: 'hidden',
  },
  dock: {
    position: 'absolute',
    bottom: -(CARD_H - PEEK),
    left: 16,
    right: 16,
    height: CARD_H,
    zIndex: 60,
  },
  cardSlot: {
    position: 'absolute',
    bottom: 0,
  },
});

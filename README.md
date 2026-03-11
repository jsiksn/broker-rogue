# Broker Rogue

> 합법과 불법을 넘나드는 20일 주식 생존기

> A 20-day rogue-lite stock trading survival game

![demo](assets/demo.gif)

---

## Overview

$10,000으로 시작해 20일 안에 $100,000을 만드세요.
매일 주어지는 트레이딩 카드를 사용해 시장을 유리하게 이끌고, 목표 자산에 도달하면 승리합니다.

Start with **$10,000** and reach **$100,000** within **20 days**.
Use trading cards each day to influence the market and maximize your portfolio.

---

## Gameplay

| 항목 | 내용 |
|------|------|
| 시작 자산 | $10,000 |
| 목표 자산 | $100,000 |
| 게임 기간 | 20일 |
| 손패 크기 | 5장 |

매일 장이 열리면 실시간으로 주가가 움직입니다 (08:00 ~ 16:00).
손패에서 카드를 한 장 플레이한 뒤 NEXT DAY를 눌러 다음 날로 넘어갑니다.

Each day, the market runs in real time (08:00–16:00).
Play one card from your hand, then advance to the next day.

---

## Cards

### Common ★
| 카드 | 효과 |
|------|------|
| 매수 | 보유 현금 전량으로 주식 매수 |
| 분할 매수 | 보유 현금의 50%로 주식 매수 |
| 매도 | 보유 주식 전량 매도 |
| 분할 매도 | 보유 주식의 50% 매도 |

### Rare ★★
| 카드 | 효과 |
|------|------|
| 물타기 | P&L 마이너스 상태에서만 사용 가능. 현금 전량으로 10% 효율 추가 매수 |
| 작전 | 세력 동원 — 주가를 일시적으로 최대 +10% 끌어올림 |
| 가짜뉴스 *(미개발)* | 다음 턴 변동성 2.5배 폭발 |

### Legendary ★★★
| 카드 | 효과 |
|------|------|
| 내부자 정보 *(미개발)* | 다음 날 주가 등락 방향을 미리 확인 |
| 레버리지 *(미개발)* | 현금의 2배 규모로 매수. 손익도 2배 |

---

## Tech Stack

- **Framework**: React Native + Expo (SDK 54)
- **Routing**: Expo Router
- **State**: Zustand
- **Animation**: React Native Reanimated
- **Chart**: react-native-svg
- **UI**: expo-linear-gradient, @expo/vector-icons (Feather)
- **Language**: TypeScript

---

## Getting Started

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npx expo start
```

```bash
# Install dependencies
npm install

# Start dev server
npx expo start
```

iOS 시뮬레이터, Android 에뮬레이터, 또는 Expo Go 앱으로 실행할 수 있습니다.

Run on iOS Simulator, Android Emulator, or the Expo Go app.

---

## Project Structure

```
app/
  index.tsx        # 타이틀 화면
  game.tsx         # 메인 게임 화면
  game-over.tsx    # 게임 오버 화면

src/
  components/
    StockChart.tsx     # 실시간 주가 차트
    PortfolioCard.tsx  # 자산 현황 카드
    CardFan.tsx        # 카드 부채꼴 UI
    TradingCard.tsx    # 개별 트레이딩 카드
  game/
    cards.ts       # 카드 정의 및 덱
    market.ts      # 주가 계산 로직
    engine.ts      # 게임 엔진
  store/
    gameStore.ts   # Zustand 전역 상태
```

```
app/
  index.tsx        # Title screen
  game.tsx         # Main game screen
  game-over.tsx    # Game over screen

src/
  components/
    StockChart.tsx     # Real-time stock chart
    PortfolioCard.tsx  # Portfolio summary card
    CardFan.tsx        # Card fan UI
    TradingCard.tsx    # Individual trading card
  game/
    cards.ts       # Card definitions & deck
    market.ts      # Price calculation logic
    engine.ts      # Game engine
  store/
    gameStore.ts   # Zustand global state
```

---

## Win / Lose Conditions

- **WIN** 🏆 — 총 자산이 $100,000 이상
- **LOSE** 💀 — 총 자산이 $100 미만, 또는 20일 종료 시 목표 미달

- **WIN** 🏆 — Total assets reach $100,000
- **LOSE** 💀 — Total assets drop below $100, or goal not reached by Day 20

---

*이 게임은 불법 주식 거래를 조장하지 않습니다.*

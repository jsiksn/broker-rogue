# Broker Rogue

> 합법과 불법을 넘나드는 주식 생존기

> A rogue-lite stock trading survival game

![demo](assets/demo.gif)

---

## Overview

$10,000으로 시작해 목표 자산에 도달하세요.
매일 주어지는 트레이딩 카드를 사용해 시장을 유리하게 이끌고, 목표 자산에 도달하면 승리합니다.

Start with **$10,000** and reach your goal within the time limit.
Use trading cards each day to influence the market and maximize your portfolio.

---

## Game Modes

| 모드 | 기간 | 목표 |
|------|------|------|
| Retail (개미) | 10일 | $30,000 |
| Cartel (세력) | 20일 | $100,000 |

매일 장이 열리면 실시간으로 주가가 움직입니다 (08:00 ~ 16:00).
손패에서 카드를 플레이한 뒤 NEXT DAY를 눌러 다음 날로 넘어갑니다.
매 턴 손패에는 매수/분할매수 중 최소 1장, 매도/분할매도 중 최소 1장이 보장됩니다.
오늘 종가가 내일 시작가로 이어져 오버나이트 갭이 없습니다. 주가 하한선은 $1입니다.

Each day, the market runs in real time (08:00–16:00).
Play cards from your hand, then advance to the next day.
Each hand is guaranteed to contain at least 1 buy card and 1 sell card.
Today's close becomes tomorrow's open (no overnight gap). Price floor is $1.

---

## Cards

### Common ★ (각 3장)
| 카드 | 효과 |
|------|------|
| 매수 | 보유 현금 전량으로 주식 매수 |
| 분할 매수 | 보유 현금의 50%로 주식 매수 |
| 매도 | 보유 주식 전량 매도 |
| 분할 매도 | 보유 주식의 50% 매도 |

### Rare ★★ (각 2장)
| 카드 | 효과 |
|------|------|
| 물타기 | P&L 마이너스 상태에서만 사용 가능. 현금 전량으로 10% 효율 추가 매수 |
| 작전 | 세력 동원 — 다음 턴 주가를 +5~15% 강제 상승 (3–8초 랜덤 애니메이션) |
| 가짜뉴스 | 루머 유포 — 다음 날 장중 변동성을 2.5배로 폭발 |

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
  index.tsx        # 타이틀 / 모드 선택 화면
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
  index.tsx        # Title / mode select screen
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

- **WIN** 🏆 — 총 자산이 목표 금액 이상
- **LOSE (파산)** 💀 — 총 자산이 $10 미만
- **LOSE (목표 미달)** 💀 — 기간 종료 시 목표 미달

- **WIN** 🏆 — Total assets reach the mode goal
- **LOSE (Bankrupt)** 💀 — Total assets drop below $10
- **LOSE (Goal not reached)** 💀 — Goal not reached by the final day

---

*이 게임은 불법 주식 거래를 조장하지 않습니다.*

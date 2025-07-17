# Checkers Game

Simple checkers game app.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd checkers
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to:

```
http://localhost:3000
```

## 🧪 Testing

This project uses Jest and React Testing Library for comprehensive testing with a focus on business logic validation, React hook testing, and end-to-end game flow verification.

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test gameUtils.test.ts
npm test useGame.test.ts
npm test game.test.ts
```

### Testing Strategy

Our testing approach follows the **Testing Pyramid** principle:

- **70% Unit Tests**: Core game logic and utilities
- **20% Integration Tests**: Component interactions and game flows
- **10% End-to-End Tests**: Complete user scenarios

#### Test Prioritization

1. **Critical Business Logic** (gameUtils.ts) - Game rules, move validation, AI logic
2. **State Management** (useGame.ts) - React hooks, timers, action dispatching
3. **Configuration** (game.ts) - Constants and game settings validation

### Test Files Overview

#### 1. `constants/game.test.ts` - Configuration Testing

**Purpose**: Validates game constants and configuration settings
**Coverage**: 100% of game constants and rules

```typescript
describe("Game Constants", () => {
  // Board configuration validation
  // Initial piece positioning tests
  // Player movement rules verification
  // Game settings validation
});
```

**Key Test Areas**:

- ✅ Board size and structure validation
- ✅ Initial piece positioning on dark squares
- ✅ Player movement directions and king rows
- ✅ Game rules and settings consistency
- ✅ Animation timings and UI constants

**Why This Matters**: Ensures game configuration is correct and consistent, preventing runtime errors from invalid constants.

---

#### 2. `utils/gameUtils.test.ts` - Core Game Logic Testing

**Purpose**: Comprehensive testing of game engine and business logic
**Coverage**: 95%+ of all game utility functions with edge cases

```typescript
describe("gameUtils", () => {
  // Board initialization and validation
  // Move calculation and validation
  // Capture logic and multi-capture scenarios
  // AI decision making and scoring
  // Game state transitions
});
```

**Key Test Areas**:

- ✅ **Board Initialization**: 8x8 grid creation, checker placement, dark square validation
- ✅ **Position Validation**: Boundary checking, coordinate validation
- ✅ **Move Validation**: Legal move generation, capture detection, force capture rules
- ✅ **Game State Management**: Piece selection, move execution, player switching
- ✅ **King Logic**: Promotion conditions, bidirectional movement
- ✅ **Capture Mechanics**: Single captures, multi-capture sequences, piece removal
- ✅ **AI Intelligence**: Move scoring, capture preference, strategic positioning
- ✅ **Edge Cases**: Empty boards, boundary conditions, invalid inputs

**Critical Test Scenarios**:

```typescript
it("should handle multi-capture scenarios", () => {
  // Tests complex capture sequences
  // Validates mustContinueCapture logic
  // Ensures proper piece removal
});

it("should promote piece to king when reaching end", () => {
  // Tests king promotion conditions
  // Validates king movement abilities
});

it("should prefer capture moves in AI logic", () => {
  // Tests AI decision making
  // Validates move scoring algorithms
});
```

**Why This Matters**: The game engine is the heart of the application. These tests ensure all checkers rules are implemented correctly, preventing game-breaking bugs.

---

#### 3. `hooks/useGame.test.ts` - React Hook Testing

**Purpose**: Tests React state management, timers, and user interactions
**Coverage**: 100% of hook functionality including custom hooks and memoization

```typescript
describe("useGame Hook", () => {
  // Hook initialization and state management
  // Timer functionality (game timer, turn timer)
  // AI integration and move automation
  // User interaction handlers
  // Performance and memoization
});
```

**Key Test Areas**:

- ✅ **Hook Initialization**: Proper state setup, function availability
- ✅ **Game Actions**: Piece selection, move execution, game reset
- ✅ **Timer System**: Game timer, turn timer, timer cleanup
- ✅ **AI Integration**: Automated moves, delay handling, turn management
- ✅ **Drag & Drop**: Piece dragging validation, move execution
- ✅ **Performance**: Function memoization, re-render optimization
- ✅ **Error Handling**: Invalid moves, null checks, graceful failures

**Advanced Testing Patterns**:

```typescript
it("should handle timer cleanup on unmount", () => {
  // Tests React lifecycle management
  // Prevents memory leaks
});

it("should maintain stable function references", () => {
  // Tests memoization effectiveness
  // Ensures performance optimization
});

it("should make AI move when it is AI player turn", () => {
  // Tests AI integration with timers
  // Validates async behavior
});
```

**Mock Strategy**:

```typescript
jest.mock("@/utils/gameUtils", () => ({
  initializeGameState: jest.fn(),
  selectPiece: jest.fn(),
  makeMove: jest.fn(),
  // ... other mocked functions
}));
```

**Why This Matters**: React hooks manage application state and side effects. These tests ensure reliable state transitions, proper timer management, and optimal performance.

### Test Architecture

#### Testing Tools & Libraries

- **Jest**: Test runner and assertion library
- **React Testing Library**: React component and hook testing
- **@testing-library/react-hooks**: Custom hook testing utilities
- **jest.useFakeTimers()**: Timer and async behavior testing

#### Mock Strategy

- **Game Utils**: Isolated unit testing of React logic
- **Timer Functions**: Controlled async behavior testing
- **AI Integration**: Predictable move generation testing

#### Coverage Goals

- **Statements**: 95%+
- **Branches**: 90%+
- **Functions**: 100%
- **Lines**: 95%+

### Running Specific Test Suites

```bash
# Test game constants and configuration
npm test constants/game.test.ts

# Test core game logic and algorithms
npm test utils/gameUtils.test.ts

# Test React hooks and state management
npm test hooks/useGame.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="capture"
npm test -- --testNamePattern="AI"
npm test -- --testNamePattern="timer"
```

### Test Development Best Practices

1. **Test Structure**: Follow AAA pattern (Arrange, Act, Assert)
2. **Mock Strategy**: Mock dependencies, not implementation details
3. **Edge Cases**: Test boundary conditions and error scenarios
4. **Performance**: Verify memoization and optimization
5. **Integration**: Test complete user flows and interactions

### Continuous Integration

Tests run automatically on:

- **Pre-commit**: Staged files only
- **Pull Requests**: Full test suite
- **Main Branch**: Full test suite + coverage report

### Test Coverage Reports

Generate detailed coverage reports:

```bash
npm run test:coverage
```

Coverage reports are available in `coverage/lcov-report/index.html`

## Structure

```
checkers/
├── app/                    # Next.js app router pages
│   ├── globals.css        # Global styles and CSS variables
│   └── layout.tsx         # Root layout component
├── components/            # Reusable React components
│   └── ui/               # shadcn/ui components
├── constants/            # Game constants and configuration
│   ├── game.ts          # Core game constants
│   └── game.test.ts     # Constants tests
├── lib/                  # Utility functions and hooks
│   └── utils.ts         # Common utilities (cn function)
├── types/               # TypeScript type definitions
│   └── game.ts         # Game-related types
├── jest.config.js      # Jest testing configuration
├── jest.setup.js       # Jest setup and mocks
└── components.json     # shadcn/ui configuration
```

## Features

### Current Features

- Modern Next.js 15 setup with TypeScript
- Tailwind CSS styling with custom game themes
- shadcn/ui components for consistent UI
- Comprehensive type definitions
- Game constants and rules configuration
- Jest testing framework setup

## Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Testing**: Jest + React Testing Library
- **Icons**: Lucide React

## Rules

- Standard checkers rules on an 8x8 board
- Pieces move diagonally on dark squares only
- Captures are mandatory when available
- Multiple captures in a single turn are required
- Pieces become kings when reaching the opposite end
- Kings can move backwards
- Win by capturing all opponent pieces or blocking all moves

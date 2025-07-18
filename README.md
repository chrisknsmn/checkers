# Checkers Game

## Challenge

Checkers take-home challenge:

The goal of this exercise is to write a simple checkers game app, preferably using ReactJS. The minimal requirements are:

- Implement basic game mechanics: taking turns, basic moves and jumps over the enemy checkers.
- Players should be able to drag-n-drop checkers using a mouse. Additional ways to control the game are up to you.
- On mouse over checker, please highlight cells where a checker can possibly move to
- If there is an opportunity to capture an enemy checker - it should be the only valid move
- No-brain AI player: could make a move to any random valid cell
- Make sure that the app is stable across major browsers

The primary areas to focus are code readability, state management, and overall user experience. You may use any state management approach of your choice. Feel free to use any resources to assist in solving the problem (Google search, ChatGPT, documentation, etc.). Try to minimize the amount of external dependencies in your app. Ensure your app is documented. The quality of your submission should match what you would submit to your colleagues at work for code review and be comfortable to ship to production.

Suggested ways to stand out of the crowd:

- Unit tests
- TypeScript
- Better game stats UI (game time, number of moves, victory banners etc.)

The best way to stand out of the crowd is to find a particular part of the problem that you are interested in and do a deeper dive technically!

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/chrisknsmn/checkers
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

## Structure

```
checkers/
├── app/                    # Next.js app router pages
│   ├── globals.css         # Global styles and CSS variables
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Main page component
├── components/             # Reusable React components
│   ├── Board.tsx           # Game board component
│   ├── Checker.tsx         # Individual checker piece
│   ├── Score.tsx           # Score display component
│   ├── gamestats/          # Game statistics components
│   │   ├── GameStats.tsx   # Main stats container
│   │   ├── MoveHistory.tsx # Move history display
│   │   ├── PlayerRows.tsx  # Player information
│   │   ├── SettingsRow.tsx # Game settings
│   │   └── TimingRow.tsx   # Timer display
│   └── ui/                 # shadcn/ui components
├── constants/              # Game constants and configuration
│   ├── game.ts             # Core game constants
│   └── game.test.ts        # Constants tests
├── hooks/                  # React hooks
│   ├── useGame.ts          # Main game state hook
│   ├── useGame.test.ts     # Game hook tests
│   └── useTheme.ts         # Theme management hook
├── lib/                    # Utility functions
│   └── utils.ts            # Common utilities (cn function)
├── types/                  # TypeScript type definitions
│   └── game.ts             # Game-related types
├── utils/                  # Game utility functions
│   ├── gameUtils.ts        # Core game logic
│   └── gameUtils.test.ts   # Game logic tests
├── jest.config.js          # Jest testing configuration
├── jest.setup.js           # Jest setup and mocks
├── eslint.config.mjs       # ESLint configuration
├── next.config.ts          # Next.js configuration
├── postcss.config.mjs      # PostCSS configuration
├── tsconfig.json           # TypeScript configuration
└── components.json         # shadcn/ui configuration
```

## Testing

This project uses TypeScript, Jest, and React Testing Library to validate game logic and custom hooks.

### Key Areas Covered

- Game Logic: Move validation, captures, king promotion, multi-capture
- React Hooks: State transitions, timers, AI turns, cleanup
- Configuration: Board size, piece positions, player rules
- Edge Cases: Invalid input, empty states, lifecycle behavior
- AI Logic: Random valid move generation with capture priority

### Running Tests

```bash
# Run all tests once
npm test

# Watch mode (auto-restarts on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

### Running Specific Test Suites

```bash
# Test configuration and constants
npm test constants/game.test.ts

# Test core game logic
npm test utils/gameUtils.test.ts

# Test React hooks and state
npm test hooks/useGame.test.ts

# Run by test name pattern
npm test -- --testNamePattern="capture"
npm test -- --testNamePattern="AI"
npm test -- --testNamePattern="timer"
```

### Tooling & Strategy

- jest.mock() for isolating utilities
- jest.useFakeTimers() to control async timers
- @testing-library/react-hooks for testing custom hooks
- Coverage goal: 90%+ on core logic and hooks

## Features

- Modern Next.js 15 setup with TypeScript
- Tailwind CSS styling with custom game themes
- shadcn/ui components for consistent UI
- Comprehensive type definitions
- Game constants and rules configuration
- Jest testing framework setup
- Advanced drag and drop functionality with @dnd-kit

## Drag and Drop Implementation

The game features a sophisticated drag and drop system built with [@dnd-kit/core](https://dndkit.com/) that provides smooth, accessible, and performant piece movement.

### Key Features

- **Cross-Platform Support**: Works seamlessly on both desktop (mouse) and mobile (touch) devices
- **Visual Feedback**: Real-time highlighting of valid moves and drag states
- **Accessibility**: Built-in keyboard and screen reader support via @dnd-kit
- **Performance**: Optimized collision detection and minimal re-renders
- **Smooth Animations**: Fluid drag transitions and hover effects

### Technical Implementation

#### Components Structure

- **`Board.tsx`**: Main drag and drop context with collision detection
- **`Checker.tsx`**: Individual draggable checker pieces
- **`DroppableCell.tsx`**: Drop zones for each board square

#### Visual Feedback System

- **Valid Moves**: Green dots indicate legal destinations
- **Hover Effects**: Cells highlight when hovered during drag
- **Drag Overlay**: Semi-transparent piece follows cursor/finger
- **Capture Indicators**: Pulsing green borders on pieces that can capture
- **Piece States**: Visual distinction between draggable and non-draggable pieces

#### Performance Optimizations

- **Client-Side Hydration**: Prevents SSR/client mismatch
- **Collision Detection**: Uses `pointerWithin` for precise drop targeting
- **State Management**: Efficient hover and drag state updates
- **Memoization**: Prevents unnecessary re-renders during drag operations

### Accessibility Features

- **Keyboard Navigation**: Tab through pieces, use arrow keys to move
- **Screen Reader Support**: Announces piece positions and valid moves
- **Focus Management**: Maintains logical tab order during interactions
- **ARIA Labels**: Descriptive labels for all interactive elements

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

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

This project uses Jest and React Testing Library for comprehensive testing.

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Core game logic, constants, and utilities
- **Component Tests**: React components and UI interactions
- **Integration Tests**: Complete game flows and user interactions

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

### TODO

- Interactive 8x8 checkers board
- Drag-and-drop piece movement
- AI opponent with configurable difficulty
- Forced capture rules
- King piece promotions
- Game timer and move history
- Victory detection and statistics
- Responsive design for mobile devices

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

@dnd-kit/core



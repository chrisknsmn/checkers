# Step-by-Step Implementation Plan with Unit Testing

## 🧱 Phase 1: Foundation Setup

### 1. Set up your Next.js app

- Create Next.js project with TypeScript and Tailwind
- Confirm your directory and file structure
- Configure Tailwind CSS via `globals.css`
- Set up `components.json` and install initial shadcn components (just btn for now)

### 2. Define core types

**File:** `/types/game.ts`

```typescript
type Player = 'RED' | 'BLACK';
interface Checker { ... }
interface Cell { ... }
interface Move { ... }
interface GameState { ... }
```

**🧪 Testing Strategy:**

- **No unit tests needed** - TypeScript provides compile-time validation
- Types will be validated through usage in other components

### 3. Initialize constants

**File:** `/constants/game.ts`

- Board size, starting piece positions, colors, etc.

**🧪 Testing Strategy:**

```typescript
// constants/game.test.ts
describe("Game Constants", () => {
  test("BOARD_SIZE should be 8", () => {
    expect(BOARD_SIZE).toBe(8);
  });

  test("INITIAL_POSITIONS should have correct number of pieces", () => {
    expect(INITIAL_POSITIONS.RED).toHaveLength(12);
    expect(INITIAL_POSITIONS.BLACK).toHaveLength(12);
  });
});
```

---

## 🎮 Phase 2: Core Gameplay Logic

### 4. Implement game utility functions

**File:** `/utils/gameUtils.ts`

- `getValidMoves()`, `canCapture()`, `applyMove()`, `initializeBoard()`

**🧪 Testing Strategy (HIGH PRIORITY):**

```typescript
// utils/gameUtils.test.ts
describe("Game Utils", () => {
  describe("getValidMoves", () => {
    test("regular piece can move diagonally forward", () => {
      const moves = getValidMoves(mockBoard, { row: 2, col: 1 });
      expect(moves).toContainEqual({ row: 3, col: 0 });
    });

    test("piece at edge cannot move off board", () => {
      const moves = getValidMoves(mockBoard, { row: 0, col: 0 });
      expect(moves).not.toContainEqual({ row: -1, col: -1 });
    });
  });

  describe("canCapture", () => {
    test("can capture enemy piece with empty space behind", () => {
      const result = canCapture(mockBoardWithCapture, from, to);
      expect(result).toBe(true);
    });
  });

  describe("applyMove", () => {
    test("move updates board state correctly", () => {
      const newBoard = applyMove(mockBoard, move);
      expect(newBoard[move.to.row][move.to.col]).toEqual(piece);
    });
  });
});
```

### 5. Implement useGame.ts

**File:** `/lib/useGame.ts`

- Use `useReducer` to manage game state
- Handle actions: SELECT, MOVE, CROWN, RESET, WIN

**🧪 Testing Strategy:**

```typescript
// lib/useGame.test.ts (using @testing-library/react-hooks)
describe("useGame Hook", () => {
  test("initial state should have correct setup", () => {
    const { result } = renderHook(() => useGame());
    expect(result.current.state.currentPlayer).toBe("RED");
    expect(result.current.state.moveCount).toBe(0);
  });

  test("selectPiece should update selectedPiece", () => {
    const { result } = renderHook(() => useGame());
    act(() => {
      result.current.selectPiece({ row: 2, col: 1 });
    });
    expect(result.current.state.selectedPiece).toEqual({ row: 2, col: 1 });
  });
});
```

### 6. Implement useValidMoves.ts

**File:** `/lib/useValidMoves.ts`

- Use `useMemo` for performance optimization

**🧪 Testing Strategy:**

```typescript
// lib/useValidMoves.test.ts
describe("useValidMoves Hook", () => {
  test("returns empty array when no piece selected", () => {
    const { result } = renderHook(() => useValidMoves(mockGameState));
    expect(result.current.validMoves).toEqual([]);
  });

  test("memoizes results to prevent unnecessary recalculation", () => {
    // Test that same input returns same reference
  });
});
```

### 7. Create Board.tsx component

**File:** `/app/game/Board.tsx`

- Render 8×8 grid with drag-and-drop

**🧪 Testing Strategy:**

```typescript
// app/game/Board.test.tsx
describe("Board Component", () => {
  test("renders 64 squares", () => {
    render(<Board gameState={mockGameState} />);
    expect(screen.getAllByTestId("board-square")).toHaveLength(64);
  });

  test("highlights valid moves when piece selected", () => {
    render(<Board gameState={mockStateWithSelection} />);
    expect(screen.getByTestId("highlight-square")).toBeInTheDocument();
  });
});
```

### 8. Build Checker.tsx component

**File:** `/app/game/Checker.tsx`

- Draggable piece with king styling

**🧪 Testing Strategy:**

```typescript
// app/game/Checker.test.tsx
describe("Checker Component", () => {
  test("renders king piece with crown indicator", () => {
    render(<Checker piece={{ ...mockPiece, isKing: true }} />);
    expect(screen.getByTestId("king-crown")).toBeInTheDocument();
  });

  test("applies correct color classes", () => {
    render(<Checker piece={{ color: "RED" }} />);
    expect(screen.getByTestId("checker")).toHaveClass("bg-red-500");
  });
});
```

---

## 🤖 Phase 3: AI Opponent

### 9. Implement AI utilities

**File:** `/utils/ai.ts`

- `getAllValidMoves()`, `selectRandomMove()`

**🧪 Testing Strategy (HIGH PRIORITY):**

```typescript
// utils/ai.test.ts
describe("AI Utils", () => {
  test("getAllValidMoves returns all possible moves for player", () => {
    const moves = getAllValidMoves(mockBoard, "BLACK");
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every((move) => move.player === "BLACK")).toBe(true);
  });

  test("selectRandomMove returns valid move", () => {
    const validMoves = [move1, move2, move3];
    const selected = selectRandomMove(validMoves);
    expect(validMoves).toContain(selected);
  });

  test("AI respects forced capture rules", () => {
    const moves = getAllValidMoves(mockBoardWithCapture, "BLACK");
    expect(moves.every((move) => move.type === "CAPTURE")).toBe(true);
  });
});
```

### 10. Implement useAI.ts

**File:** `/lib/useAI.ts`

- Auto-trigger AI moves

**🧪 Testing Strategy:**

```typescript
// lib/useAI.test.ts
describe("useAI Hook", () => {
  test("triggers AI move when AI turn begins", async () => {
    const mockMakeMove = jest.fn();
    renderHook(() => useAI(mockAIGameState, mockMakeMove));

    await waitFor(() => {
      expect(mockMakeMove).toHaveBeenCalled();
    });
  });

  test("does not trigger on human turn", () => {
    const mockMakeMove = jest.fn();
    renderHook(() => useAI(mockHumanGameState, mockMakeMove));
    expect(mockMakeMove).not.toHaveBeenCalled();
  });
});
```

---

## ⚙️ Phase 4: Game Settings

### 11. Build useSettings.ts

**File:** `/lib/useSettings.ts`

- Manage AI and forced capture toggles

**🧪 Testing Strategy:**

```typescript
// lib/useSettings.test.ts
describe("useSettings Hook", () => {
  test("toggleAI switches AI state", () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.toggleAI();
    });
    expect(result.current.settings.isAIEnabled).toBe(true);
  });

  test("resetSettings returns to defaults", () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.resetSettings();
    });
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });
});
```

### 12. Create GameSettings.tsx

**File:** `/app/game/GameSettings.tsx`

- Settings panel with toggles

**🧪 Testing Strategy:**

```typescript
// app/game/GameSettings.test.tsx
describe("GameSettings Component", () => {
  test("AI toggle updates settings", () => {
    const mockToggleAI = jest.fn();
    render(<GameSettings onToggleAI={mockToggleAI} />);

    fireEvent.click(screen.getByLabelText("AI Opponent"));
    expect(mockToggleAI).toHaveBeenCalled();
  });
});
```

---

## ⏱ Phase 5: Timer (Optional)

### 13. Build useTimer.ts

**File:** `/lib/useTimer.ts`

- Game timer with start/stop/reset

**🧪 Testing Strategy:**

```typescript
// lib/useTimer.test.ts
describe("useTimer Hook", () => {
  test("timer increments every second when started", async () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.startTimer();
    });

    await waitFor(
      () => {
        expect(result.current.seconds).toBeGreaterThan(0);
      },
      { timeout: 1100 }
    );
  });

  test("timer stops when stopTimer called", () => {
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.startTimer();
      result.current.stopTimer();
    });
    expect(result.current.isRunning).toBe(false);
  });
});
```

---

## 📊 Phase 6: Stats & UX Feedback

### 14. Create GameStats.tsx

**File:** `/app/game/GameStats.tsx`

- Display current player, move count, timer

**🧪 Testing Strategy:**

```typescript
// app/game/GameStats.test.tsx
describe("GameStats Component", () => {
  test("displays current player correctly", () => {
    render(<GameStats currentPlayer="RED" moveCount={5} />);
    expect(screen.getByText("Current Player: RED")).toBeInTheDocument();
  });

  test("formats timer correctly", () => {
    render(<GameStats timer={125} />);
    expect(screen.getByText("02:05")).toBeInTheDocument();
  });
});
```

### 15. Build VictoryBanner.tsx

**File:** `/app/game/VictoryBanner.tsx`

- Victory detection and banner

**🧪 Testing Strategy:**

```typescript
// app/game/VictoryBanner.test.tsx
describe("VictoryBanner Component", () => {
  test("displays winner correctly", () => {
    render(<VictoryBanner winner="RED" />);
    expect(screen.getByText("RED Wins!")).toBeInTheDocument();
  });

  test("calls onNewGame when button clicked", () => {
    const mockNewGame = jest.fn();
    render(<VictoryBanner winner="RED" onNewGame={mockNewGame} />);

    fireEvent.click(screen.getByText("New Game"));
    expect(mockNewGame).toHaveBeenCalled();
  });
});
```

---

## 🎨 Phase 7: Final UX & Styling

### 16. Polish and responsive design

- Drag-and-drop animations
- Mobile responsiveness
- Accessibility features

**🧪 Testing Strategy:**

```typescript
// Integration tests
describe("Game Integration", () => {
  test("complete game flow works correctly", () => {
    render(<GamePage />);

    // Select piece
    fireEvent.click(screen.getByTestId("checker-2-1"));

    // Make move
    fireEvent.click(screen.getByTestId("square-3-0"));

    // Verify turn switched
    expect(screen.getByText("Current Player: BLACK")).toBeInTheDocument();
  });
});
```

---

## 🧪 **Testing Setup Files Needed:**

### **`jest.config.js`**

```javascript
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

### **`jest.setup.js`**

```javascript
import "@testing-library/jest-dom";
```

### **`package.json` testing dependencies:**

```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "@testing-library/react-hooks": "^8.0.1",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```

## 🎯 **Testing Priority:**

1. **HIGH**: `gameUtils.ts` - Core game logic
2. **HIGH**: `ai.ts` - AI behavior
3. **MEDIUM**: All hooks (`useGame`, `useValidMoves`, etc.)
4. **MEDIUM**: Main components (`Board`, `Checker`)
5. **LOW**: UI components (`GameStats`, `VictoryBanner`)

This testing strategy ensures your core game logic is bulletproof while providing good coverage for the UI components!

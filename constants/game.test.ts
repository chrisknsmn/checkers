import {
  BOARD_SIZE,
  INITIAL_POSITIONS,
  PLAYER_DIRECTIONS,
  KING_ROW,
  DEFAULT_SETTINGS,
  GAME_RULES,
  ANIMATION_DURATIONS,
  BOARD_LAYOUT,
  GAME_MESSAGES,
} from "./game";

describe("Game Constants", () => {
  describe("Board Configuration", () => {
    test("BOARD_SIZE should be 8", () => {
      expect(BOARD_SIZE).toBe(8);
    });

    test("BOARD_SIZE should be a number", () => {
      expect(typeof BOARD_SIZE).toBe("number");
    });
  });

  describe("Initial Positions", () => {
    test("INITIAL_POSITIONS should have correct number of pieces", () => {
      expect(INITIAL_POSITIONS.RED).toHaveLength(12);
      expect(INITIAL_POSITIONS.BLACK).toHaveLength(12);
    });

    test("RED and BLACK should have equal number of pieces", () => {
      expect(INITIAL_POSITIONS.RED.length).toBe(INITIAL_POSITIONS.BLACK.length);
    });

    test("all initial positions should be within board bounds", () => {
      const allPositions = [
        ...INITIAL_POSITIONS.RED,
        ...INITIAL_POSITIONS.BLACK,
      ];

      allPositions.forEach((position) => {
        expect(position.row).toBeGreaterThanOrEqual(0);
        expect(position.row).toBeLessThan(BOARD_SIZE);
        expect(position.col).toBeGreaterThanOrEqual(0);
        expect(position.col).toBeLessThan(BOARD_SIZE);
      });
    });

    test("initial positions should only be on dark squares", () => {
      const allPositions = [
        ...INITIAL_POSITIONS.RED,
        ...INITIAL_POSITIONS.BLACK,
      ];

      allPositions.forEach((position) => {
        // Dark squares have (row + col) % 2 === 1
        expect((position.row + position.col) % 2).toBe(1);
      });
    });

    test("RED pieces should be on rows 0, 1, 2", () => {
      const redRows = INITIAL_POSITIONS.RED.map((pos) => pos.row);
      const uniqueRedRows = [...new Set(redRows)].sort();

      expect(uniqueRedRows).toEqual([0, 1, 2]);
    });

    test("BLACK pieces should be on rows 5, 6, 7", () => {
      const blackRows = INITIAL_POSITIONS.BLACK.map((pos) => pos.row);
      const uniqueBlackRows = [...new Set(blackRows)].sort();

      expect(uniqueBlackRows).toEqual([5, 6, 7]);
    });

    test("no two pieces should occupy the same position", () => {
      const allPositions = [
        ...INITIAL_POSITIONS.RED,
        ...INITIAL_POSITIONS.BLACK,
      ];
      const positionStrings = allPositions.map(
        (pos) => `${pos.row},${pos.col}`
      );
      const uniquePositions = new Set(positionStrings);

      expect(uniquePositions.size).toBe(allPositions.length);
    });
  });

  describe("Player Configuration", () => {
    test("PLAYER_DIRECTIONS should have correct movement directions", () => {
      expect(PLAYER_DIRECTIONS.RED).toBe(1); // moves down
      expect(PLAYER_DIRECTIONS.BLACK).toBe(-1); // moves up
    });

    test("KING_ROW should have correct promotion rows", () => {
      expect(KING_ROW.RED).toBe(7); // bottom row
      expect(KING_ROW.BLACK).toBe(0); // top row
    });

    test("king rows should be opposite ends of board", () => {
      expect(KING_ROW.RED).toBe(BOARD_SIZE - 1);
      expect(KING_ROW.BLACK).toBe(0);
    });
  });

  describe("Default Settings", () => {
    test("DEFAULT_SETTINGS should have correct initial values", () => {
      expect(DEFAULT_SETTINGS.isAIEnabled).toBe(false);
      expect(DEFAULT_SETTINGS.aiPlayer).toBe("BLACK");
      expect(DEFAULT_SETTINGS.forcedCaptureEnabled).toBe(true);
      expect(DEFAULT_SETTINGS.timerEnabled).toBe(false);
      expect(DEFAULT_SETTINGS.moveTimeLimit).toBe(60000);
    });

    test("moveTimeLimit should be a positive number", () => {
      expect(DEFAULT_SETTINGS.moveTimeLimit).toBeGreaterThan(0);
      expect(typeof DEFAULT_SETTINGS.moveTimeLimit).toBe("number");
    });
  });

  describe("Game Rules", () => {
    test("GAME_RULES should have correct values", () => {
      expect(GAME_RULES.MAX_PIECES_PER_PLAYER).toBe(12);
      expect(GAME_RULES.MIN_PIECES_FOR_GAME).toBe(1);
      expect(GAME_RULES.CAPTURE_REQUIRED).toBe(true);
      expect(GAME_RULES.MULTIPLE_CAPTURES_REQUIRED).toBe(true);
      expect(GAME_RULES.KING_CAN_MOVE_BACKWARDS).toBe(true);
      expect(GAME_RULES.REGULAR_PIECE_SINGLE_STEP).toBe(true);
    });

    test("MAX_PIECES_PER_PLAYER should match initial positions count", () => {
      expect(GAME_RULES.MAX_PIECES_PER_PLAYER).toBe(
        INITIAL_POSITIONS.RED.length
      );
      expect(GAME_RULES.MAX_PIECES_PER_PLAYER).toBe(
        INITIAL_POSITIONS.BLACK.length
      );
    });
  });

  describe("Animation Durations", () => {
    test("all animation durations should be positive numbers", () => {
      Object.values(ANIMATION_DURATIONS).forEach((duration) => {
        expect(duration).toBeGreaterThan(0);
        expect(typeof duration).toBe("number");
      });
    });

    test("ANIMATION_DURATIONS should have reasonable values", () => {
      expect(ANIMATION_DURATIONS.PIECE_MOVE).toBeLessThan(1000);
      expect(ANIMATION_DURATIONS.PIECE_CAPTURE).toBeLessThan(1000);
      expect(ANIMATION_DURATIONS.BOARD_HIGHLIGHT).toBeLessThan(1000);
      expect(ANIMATION_DURATIONS.KING_PROMOTION).toBeLessThan(2000);
    });
  });

  describe("Board Layout", () => {
    test("BOARD_LAYOUT should have positive numeric values", () => {
      expect(BOARD_LAYOUT.CELL_SIZE).toBeGreaterThan(0);
      expect(BOARD_LAYOUT.PIECE_SIZE_RATIO).toBeGreaterThan(0);
      expect(BOARD_LAYOUT.PIECE_SIZE_RATIO).toBeLessThanOrEqual(1);
      expect(BOARD_LAYOUT.BORDER_WIDTH).toBeGreaterThanOrEqual(0);
      expect(BOARD_LAYOUT.GAP_SIZE).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Game Messages", () => {
    test("GAME_MESSAGES should have non-empty strings", () => {
      Object.values(GAME_MESSAGES).forEach((message) => {
        expect(typeof message).toBe("string");
        expect(message.length).toBeGreaterThan(0);
      });
    });

    test("turn messages should mention correct players", () => {
      expect(GAME_MESSAGES.RED_TURN).toContain("Red");
      expect(GAME_MESSAGES.BLACK_TURN).toContain("Black");
    });

    test("win messages should mention correct players", () => {
      expect(GAME_MESSAGES.RED_WINS).toContain("Red");
      expect(GAME_MESSAGES.BLACK_WINS).toContain("Black");
    });
  });
});

import {
  BOARD_SIZE,
  INITIAL_POSITIONS,
  PLAYER_DIRECTIONS,
  KING_ROW,
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
});

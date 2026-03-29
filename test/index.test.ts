/**
 * Test suite for src/index.ts — the TypeScript wrapper around sudoku.js.
 * Verifies the public Board (9×9 number[][]) API.
 */

import {
  generate,
  solve,
  get_candidates,
  print_board,
  validate_board,
  BLANK_BOARD,
} from "../src/index";
import type { Board, CandidatesGrid, Difficulty, ValidationOutput } from "../src/index";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isBoard(v: unknown): v is Board {
  return (
    Array.isArray(v) &&
    v.length === 9 &&
    v.every(
      (row) =>
        Array.isArray(row) &&
        row.length === 9 &&
        row.every((cell) => Number.isInteger(cell) && cell >= 0 && cell <= 9)
    )
  );
}

// A verified puzzle/solution pair produced at runtime via generate+solve.
let _cachedPuzzle: Board | null = null;
let _cachedSolution: Board | null = null;

async function getKnownPair(): Promise<{ puzzle: Board; solution: Board }> {
  if (!_cachedPuzzle) {
    _cachedPuzzle = await generate("easy");
    _cachedSolution = solve(_cachedPuzzle) as Board;
  }
  return { puzzle: _cachedPuzzle!, solution: _cachedSolution as Board };
}

// Reusable contradiction board — 17+ givens but two 9s in the last row,
// which makes it unsolvable without triggering the "too few givens" guard.
const UNSOLVABLE: Board = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 0, 0, 0, 0, 0, 0, 8, 4],
  [0, 6, 2, 3, 0, 0, 0, 5, 0],
  [0, 0, 0, 6, 0, 0, 0, 4, 5],
  [3, 0, 0, 0, 1, 0, 0, 0, 6],
  [0, 0, 0, 9, 0, 0, 0, 7, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0],
  [4, 0, 5, 0, 0, 2, 0, 0, 0],
  [0, 3, 0, 8, 0, 0, 0, 9, 9], // two 9s → contradiction
];

// ---------------------------------------------------------------------------
// BLANK_BOARD
// ---------------------------------------------------------------------------

describe("BLANK_BOARD", () => {
  test("is a 9×9 Board of zeros", () => {
    expect(isBoard(BLANK_BOARD)).toBe(true);
    expect(BLANK_BOARD.flat().every((n) => n === 0)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// generate
// ---------------------------------------------------------------------------

describe("generate", () => {
  // Only fast difficulties — "insane" and "inhuman" can take minutes with
  // unique=true because uniqueness-checking at ≤26 givens is exponential.
  const FAST_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "very-hard"];

  test.each(FAST_DIFFICULTIES)('returns a valid 9×9 Board for difficulty "%s"', async (d) => {
    const board = await generate(d);
    expect(isBoard(board)).toBe(true);
  });

  test("returns a valid 9×9 Board for a numeric difficulty (30 givens)", async () => {
    const board = await generate(30);
    expect(isBoard(board)).toBe(true);
    const givens = board.flat().filter((n) => n !== 0).length;
    expect(givens).toBe(30);
  }, 120_000);

  test("easy puzzle has exactly 62 givens", async () => {
    const board = await generate("easy");
    const givens = board.flat().filter((n) => n !== 0).length;
    expect(givens).toBe(62);
  });

  test("all cells are integers 0–9", async () => {
    const board = await generate("easy");
    board.flat().forEach((cell) => {
      expect(Number.isInteger(cell)).toBe(true);
      expect(cell).toBeGreaterThanOrEqual(0);
      expect(cell).toBeLessThanOrEqual(9);
    });
  });

  test("two consecutive puzzles are different", async () => {
    const a = await generate("easy");
    const b = await generate("easy");
    expect(a).not.toEqual(b);
  });
});

// ---------------------------------------------------------------------------
// solve
// ---------------------------------------------------------------------------

describe("solve", () => {
  test("returns a valid 9×9 Board", async () => {
    const { puzzle, solution } = await getKnownPair();
    expect(isBoard(solution)).toBe(true);
    // Solution must equal the puzzle's givens wherever they were set
    puzzle.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell !== 0) expect(solution[r][c]).toBe(cell);
      });
    });
  });

  test("solved board has no zeros", async () => {
    const { solution } = await getKnownPair();
    solution.flat().forEach((cell) => expect(cell).not.toBe(0));
  });

  test("solve → re-solve is idempotent", async () => {
    const { solution } = await getKnownPair();
    expect(solve(solution)).toEqual(solution);
  });

  test("returns null for an unsolvable board", () => {
    expect(solve(UNSOLVABLE)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// get_candidates
// ---------------------------------------------------------------------------

describe("get_candidates", () => {
  test("returns a 9×9 CandidatesGrid for a valid unsolved board", async () => {
    const { puzzle } = await getKnownPair();
    const candidates: CandidatesGrid | null = get_candidates(puzzle);
    expect(candidates).not.toBeNull();
    const grid = candidates as CandidatesGrid;
    expect(grid.length).toBe(9);
    grid.forEach((row) => {
      expect(row.length).toBe(9);
      row.forEach((cell) => expect(Array.isArray(cell)).toBe(true));
    });
  });

  test("pre-filled cells have a single-digit candidate array", async () => {
    const { puzzle } = await getKnownPair();
    const candidates = get_candidates(puzzle) as CandidatesGrid;
    puzzle.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell !== 0) {
          expect(candidates[r][c]).toEqual([cell]);
        }
      });
    });
  });

  test("candidate arrays contain only digits 1–9", async () => {
    const { puzzle } = await getKnownPair();
    const candidates = get_candidates(puzzle) as CandidatesGrid;
    candidates.flat(2).forEach((digit) => {
      expect(digit).toBeGreaterThanOrEqual(1);
      expect(digit).toBeLessThanOrEqual(9);
    });
  });

  test("returns null for a contradictory board", () => {
    expect(get_candidates(UNSOLVABLE)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// validate_board
// ---------------------------------------------------------------------------

describe("validate_board", () => {
  test("returns valid: true for a valid generated puzzle", async () => {
    const { puzzle } = await getKnownPair();
    const result: ValidationOutput = validate_board(puzzle);
    expect(result).toEqual({ valid: true });
  });

  test("returns valid: true for BLANK_BOARD", () => {
    const result: ValidationOutput = validate_board(BLANK_BOARD);
    expect(result).toEqual({ valid: true });
  });

  // Note: validate_board only checks format (81 cells, digits 0–9).
  // Game-logic contradictions (e.g. duplicate digits) still return valid: true
  // because boardToString always produces a format-valid dot-string.
  test("returns valid: true for a format-valid board even with game contradictions", () => {
    const result: ValidationOutput = validate_board(UNSOLVABLE);
    expect(result).toEqual({ valid: true });
  });

  test("returns valid: false with a message for a malformed board", () => {
    // An 8-row board produces a 72-char string, failing the 81-char check.
    const SHORT_BOARD: Board = Array.from({ length: 8 }, () => Array(9).fill(0));
    const result: ValidationOutput = validate_board(SHORT_BOARD);
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Invalid board size. Board must be exactly 81 squares.");
  });
});

// ---------------------------------------------------------------------------
// print_board
// ---------------------------------------------------------------------------

describe("print_board", () => {
  test("does not throw for a Board", async () => {
    const { puzzle } = await getKnownPair();
    expect(() => print_board(puzzle)).not.toThrow();
  });

  // CandidatesGrid uses multi-char cell strings (e.g. "149") which the
  // internal sudoku.js print_board does not support — only Board is tested.
});

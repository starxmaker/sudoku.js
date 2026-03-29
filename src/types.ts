// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * Named difficulty levels. Each maps to a fixed number of pre-filled squares:
 * - `easy`      → 62 givens
 * - `medium`    → 53 givens
 * - `hard`      → 44 givens
 * - `very-hard` → 35 givens
 * - `insane`    → 26 givens
 * - `inhuman`   → 17 givens (minimum possible)
 */
export type Difficulty =
  | "easy"
  | "medium"
  | "hard"
  | "very-hard"
  | "insane"
  | "inhuman";

/**
 * A 9×9 grid representing a Sudoku board. Each inner array is a row;
 * each cell holds `1`–`9` for a given digit or `0` for an empty square.
 */
export type Board = number[][];

/**
 * A 9×9 three-dimensional array where each cell holds the digits still possible
 * in that position (e.g. `[1, 3, 5]`, `[9]`, `[1, 2, 3, 4, 5, 6, 7, 8, 9]`).
 * An empty inner array (`[]`) means no candidates remain (contradiction).
 */
export type CandidatesGrid = number[][][];

/**
 * The result of {@link validate_board}.
 * - `valid: true` — the board is well-formed; `message` is absent.
 * - `valid: false` — the board is invalid; `message` describes the problem.
 */
export interface ValidationOutput {
  valid: boolean;
  message?: string;
}

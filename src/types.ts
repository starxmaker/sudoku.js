// ---------------------------------------------------------------------------
// Internal interface matching the sudoku.js runtime object
// ---------------------------------------------------------------------------
export interface SudokuLib {
  DIGITS: string;
  BLANK_CHAR: string;
  BLANK_BOARD: string;
  generate(difficulty: Difficulty | number, unique?: boolean): string;
  solve(board: string, reverse?: boolean): string | false;
  get_candidates(board: string): string[][] | false;
  board_string_to_grid(boardString: string): string[][];
  board_grid_to_string(boardGrid: string[][]): string;
  print_board(board: string | string[][]): void;
  validate_board(board: string): true | string;
}

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
 * An 81-character string representing a Sudoku board read left-to-right,
 * top-to-bottom. Each character is either a digit `'1'`–`'9'` or `'.'` for
 * an empty square.
 */
export type BoardString = string;

/**
 * A 9×9 two-dimensional array representation of a Sudoku board. Each cell
 * holds a single-character string: `'1'`–`'9'` or `'.'` for empty.
 */
export type BoardGrid = string[][];

/**
 * A 9×9 two-dimensional array where each cell holds a string of the digits
 * still possible in that position (e.g. `"135"`, `"9"`, `"123456789"`).
 */
export type CandidatesGrid = string[][];

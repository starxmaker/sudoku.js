/**
 * Describes the public API of the core sudoku.js library as it exists at
 * runtime. All methods operate on the dot-notation string format used
 * internally by sudoku.js (`'.'` = empty square, `'1'`–`'9'` = digit).
 *
 * This interface is consumed by the TypeScript wrapper (index.ts) and the
 * converters, and is not exported as part of the public package API.
 */
export interface SudokuLib {
  // Constants
  DIGITS: string;
  BLANK_CHAR: string;
  BLANK_BOARD: string;

  // Core API
  generate(difficulty: string | number, unique?: boolean): string;
  solve(board: string, reverse?: boolean): string | false;
  get_candidates(board: string): string[][] | false;
  board_string_to_grid(boardString: string): string[][];
  board_grid_to_string(boardGrid: string[][]): string;
  print_board(board: string | string[][]): void;
  validate_board(board: string): true | string;
}


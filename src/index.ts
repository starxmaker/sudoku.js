import type { SudokuLib } from "./internal";
import type { Difficulty, Board, CandidatesGrid, ValidationOutput } from "./types";
import { boardToString, stringToBoard } from "./converters";

export type { Difficulty, Board, CandidatesGrid, ValidationOutput };

// eslint-disable-next-line @typescript-eslint/no-require-imports
const _sudoku: SudokuLib = require("../sudoku.js").sudoku;

// ---------------------------------------------------------------------------
// Re-exported constants
// ---------------------------------------------------------------------------

/** A 9×9 {@link Board} of zeros representing a fully blank board. */
export const BLANK_BOARD: Board = stringToBoard(_sudoku.BLANK_BOARD);

// ---------------------------------------------------------------------------
// Wrapper functions
// ---------------------------------------------------------------------------

/**
 * Generate a new Sudoku puzzle.
 *
 * @param difficulty - A named difficulty level or an integer between 17 and 81
 *   representing the exact number of pre-filled squares.
 * @param unique - When `true` (default) the puzzle is guaranteed to have
 *   exactly one solution.
 * @returns A 9×9 {@link Board} where `1`–`9` are givens and `0` is empty.
 * @throws If a valid puzzle cannot be generated (extremely rare at low `unique`
 *   counts — retry is the standard workaround).
 *
 * @example
 * ```ts
 * import { generate } from "@starxmaker/sudoku.js";
 * const puzzle = generate("easy");    // [[5, 0, 0, 1, 9, ...], ...]
 * const custom = generate(30, false); // 30 givens, may have many solutions
 * ```
 */
export async function generate(
  difficulty: Difficulty | number,
  unique?: boolean
): Promise<Board> {
  return stringToBoard(_sudoku.generate(difficulty, unique));
}

/**
 * Solve a Sudoku puzzle.
 *
 * @param board - A 9×9 {@link Board} with at least 17 non-zero values.
 * @param reverse - When `true` the solver works backwards through candidates,
 *   useful for uniqueness checking.
 * @returns The solved 9×9 {@link Board}, or `null` if no solution exists.
 *
 * @example
 * ```ts
 * import { generate, solve } from "@starxmaker/sudoku.js";
 * const solution = solve(generate("hard"));
 * if (solution === null) console.error("Unsolvable!");
 * else console.log(solution[0]); // first row, e.g. [5, 2, 7, 3, 1, 6, 4, 8, 9]
 * ```
 */
export function solve(
  board: Board,
  reverse?: boolean
): Board | null {
  const result = _sudoku.solve(boardToString(board), reverse);
  return result === false ? null : stringToBoard(result);
}

/**
 * Compute the remaining candidate digits for every square of an unsolved board.
 *
 * @param board - A 9×9 {@link Board}.
 * @returns A 9×9 {@link CandidatesGrid} where each cell is an array of still-
 *   possible digits, or `null` if the board contains a contradiction.
 *
 * @example
 * ```ts
 * import { generate, get_candidates } from "@starxmaker/sudoku.js";
 * const candidates = get_candidates(await generate("easy"));
 * if (candidates === null) console.error("Contradiction!");
 * // candidates[0][0] might be [4] (forced) or [1, 4, 8] (multiple options)
 * ```
 */
export function get_candidates(board: Board): CandidatesGrid | null {
  const result = _sudoku.get_candidates(boardToString(board));
  if (result === false) return null;
  return result.map((row) => row.map((cell) => cell.split("").map(Number)));
}

/**
 * Pretty-print a board to `console.log`. Accepts either a {@link Board}
 * or a {@link CandidatesGrid}.
 */
export function print_board(board: Board | CandidatesGrid): void {
  if (typeof board[0][0] === "number") {
    return _sudoku.print_board(boardToString(board as Board));
  }
  const strGrid = (board as CandidatesGrid).map((row) =>
    row.map((cell) => cell.join(""))
  );
  return _sudoku.print_board(strGrid);
}

/**
 * Validate a board.
 *
 * @returns A {@link ValidationOutput} with `valid: true` when the board is
 *   well-formed, or `valid: false` and a `message` describing the problem.
 *
 * @example
 * ```ts
 * const { valid, message } = validate_board(puzzle);
 * if (!valid) throw new Error(message);
 * ```
 */
export function validate_board(board: Board): ValidationOutput {
  const result = _sudoku.validate_board(boardToString(board));
  return result === true ? { valid: true } : { valid: false, message: result };
}

// ---------------------------------------------------------------------------
// Namespace / default export
// ---------------------------------------------------------------------------

const sudoku = {
  BLANK_BOARD,
  generate,
  solve,
  get_candidates,
  print_board,
  validate_board,
};

export default sudoku;


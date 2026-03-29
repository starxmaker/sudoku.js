import type { Board } from "./types";

/**
 * Convert a {@link Board} to the internal dot-notation string used by sudoku.js.
 * Empty squares (0) become `'.'`, digits become their string equivalent.
 */
export function boardToString(board: Board): string {
  return board.flat().map(n => n === 0 ? "." : String(n)).join("");
}

/**
 * Convert an internal dot-notation string from sudoku.js to a {@link Board}.
 * `'.'` becomes `0`, digit characters become their numeric equivalent.
 */
export function stringToBoard(board: string): Board {
  const flat = board.split("").map(c => c === "." ? 0 : parseInt(c, 10));
  const grid: Board = [];
  for (let row = 0; row < 9; row++) {
    grid.push(flat.slice(row * 9, row * 9 + 9));
  }
  return grid;
}

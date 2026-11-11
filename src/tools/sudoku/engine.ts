import { createRng, type Rng } from '../../core/random';

export type SudokuSize = 4 | 6 | 9;
export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

export const SUDOKU_SIZES: SudokuSize[] = [4, 6, 9];
export const SUDOKU_DIFFICULTIES: SudokuDifficulty[] = ['easy', 'medium', 'hard'];

interface Box {
  rows: number;
  cols: number;
}

const BOXES: Record<SudokuSize, Box> = {
  4: { rows: 2, cols: 2 },
  6: { rows: 2, cols: 3 },
  9: { rows: 3, cols: 3 },
};

const REMOVE: Record<SudokuSize, Record<SudokuDifficulty, number>> = {
  4: { easy: 5, medium: 7, hard: 9 },
  6: { easy: 12, medium: 16, hard: 20 },
  9: { easy: 30, medium: 40, hard: 48 },
};

export interface SudokuParams {
  size: SudokuSize;
  difficulty: SudokuDifficulty;
  seed: string;
}

export interface SudokuPuzzle {
  size: SudokuSize;
  boxRows: number;
  boxCols: number;
  puzzle: number[];
  solution: number[];
}

export function cellIndex(size: number, row: number, col: number): number {
  return row * size + col;
}

function usedValues(grid: number[], size: SudokuSize, row: number, col: number): boolean[] {
  const used = new Array<boolean>(size + 1).fill(false);
  for (let c = 0; c < size; c += 1) used[grid[row * size + c]] = true;
  for (let r = 0; r < size; r += 1) used[grid[r * size + col]] = true;
  const box = BOXES[size];
  const startRow = Math.floor(row / box.rows) * box.rows;
  const startCol = Math.floor(col / box.cols) * box.cols;
  for (let r = startRow; r < startRow + box.rows; r += 1) {
    for (let c = startCol; c < startCol + box.cols; c += 1) used[grid[r * size + c]] = true;
  }
  return used;
}

function candidates(grid: number[], size: SudokuSize, index: number): number[] {
  const row = Math.floor(index / size);
  const col = index % size;
  const used = usedValues(grid, size, row, col);
  const result: number[] = [];
  for (let value = 1; value <= size; value += 1) {
    if (!used[value]) result.push(value);
  }
  return result;
}

function fillGrid(grid: number[], size: SudokuSize, rng: Rng): boolean {
  let target = -1;
  let best: number[] | null = null;
  for (let index = 0; index < grid.length; index += 1) {
    if (grid[index] !== 0) continue;
    const values = candidates(grid, size, index);
    if (values.length === 0) return false;
    if (best === null || values.length < best.length) {
      best = values;
      target = index;
      if (values.length === 1) break;
    }
  }
  if (target === -1) return true;
  const order = rng.shuffle(best ?? []);
  for (const value of order) {
    grid[target] = value;
    if (fillGrid(grid, size, rng)) return true;
    grid[target] = 0;
  }
  return false;
}

function countSolutions(
  grid: number[],
  size: SudokuSize,
  limit = 2,
): number {
  let target = -1;
  let best: number[] | null = null;
  for (let index = 0; index < grid.length; index += 1) {
    if (grid[index] !== 0) continue;
    const values = candidates(grid, size, index);
    if (values.length === 0) return 0;
    if (best === null || values.length < best.length) {
      best = values;
      target = index;
      if (values.length === 1) break;
    }
  }
  if (target === -1) return 1;
  let total = 0;
  for (const value of best ?? []) {
    grid[target] = value;
    total += countSolutions(grid, size, limit - total);
    grid[target] = 0;
    if (total >= limit) return total;
  }
  return total;
}

export function generateSudoku(params: SudokuParams): SudokuPuzzle {
  const size = params.size;
  const box = BOXES[size];
  const rng = createRng(`${params.seed}|sudoku|${size}|${params.difficulty}`);
  const solution = new Array<number>(size * size).fill(0);
  fillGrid(solution, size, rng);

  const puzzle = [...solution];
  const indices = rng.shuffle(Array.from({ length: size * size }, (_, index) => index));
  let removed = 0;
  const target = REMOVE[size][params.difficulty];

  for (const index of indices) {
    if (removed >= target) break;
    const backup = puzzle[index];
    puzzle[index] = 0;
    if (countSolutions([...puzzle], size) === 1) {
      removed += 1;
    } else {
      puzzle[index] = backup;
    }
  }

  return {
    size,
    boxRows: box.rows,
    boxCols: box.cols,
    puzzle,
    solution,
  };
}

export function isSolved(grid: number[], size: SudokuSize): boolean {
  const expected = (size * (size + 1)) / 2;
  for (let r = 0; r < size; r += 1) {
    let rowSum = 0;
    let colSum = 0;
    for (let c = 0; c < size; c += 1) {
      rowSum += grid[r * size + c];
      colSum += grid[c * size + r];
    }
    if (rowSum !== expected || colSum !== expected) return false;
  }
  return true;
}

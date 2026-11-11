import { describe, expect, it } from 'vitest';
import {
  generateSudoku,
  isSolved,
  SUDOKU_DIFFICULTIES,
  SUDOKU_SIZES,
  type SudokuSize,
} from './engine';

const box = (size: SudokuSize) =>
  size === 9 ? { rows: 3, cols: 3 } : size === 6 ? { rows: 2, cols: 3 } : { rows: 2, cols: 2 };

function assertValidSolution(grid: number[], size: SudokuSize) {
  const expected = Array.from({ length: size }, (_, index) => index + 1);
  const { rows, cols } = box(size);
  for (let r = 0; r < size; r += 1) {
    expect(grid.slice(r * size, (r + 1) * size).sort((a, b) => a - b)).toEqual(expected);
  }
  for (let c = 0; c < size; c += 1) {
    const column = Array.from({ length: size }, (_, r) => grid[r * size + c]).sort((a, b) => a - b);
    expect(column).toEqual(expected);
  }
  for (let br = 0; br < size; br += rows) {
    for (let bc = 0; bc < size; bc += cols) {
      const values: number[] = [];
      for (let r = br; r < br + rows; r += 1) {
        for (let c = bc; c < bc + cols; c += 1) values.push(grid[r * size + c]);
      }
      expect(values.sort((a, b) => a - b)).toEqual(expected);
    }
  }
}

describe('sudoku engine', () => {
  it.each(SUDOKU_SIZES)('generates a valid %i×%i solution', (size) => {
    const puzzle = generateSudoku({ size, difficulty: 'medium', seed: 'test' });
    expect(puzzle.size).toBe(size);
    expect(puzzle.solution).toHaveLength(size * size);
    expect(puzzle.puzzle).toHaveLength(size * size);
    assertValidSolution(puzzle.solution, size);
    expect(puzzle.puzzle.some((value) => value === 0)).toBe(true);
    puzzle.puzzle.forEach((value, index) => {
      if (value !== 0) expect(value).toBe(puzzle.solution[index]);
    });
    expect(isSolved(puzzle.solution, size)).toBe(true);
  });

  it.each(SUDOKU_DIFFICULTIES)('generates a %s puzzle', (difficulty) => {
    const puzzle = generateSudoku({ size: 9, difficulty, seed: 'test' });
    expect(puzzle.puzzle.filter((value) => value === 0).length).toBeGreaterThan(20);
  });

  it('is deterministic for the same seed', () => {
    const first = generateSudoku({ size: 9, difficulty: 'medium', seed: 'same' });
    const second = generateSudoku({ size: 9, difficulty: 'medium', seed: 'same' });
    expect(first.puzzle).toEqual(second.puzzle);
    expect(first.solution).toEqual(second.solution);
  });

  it('produces different puzzles for different seeds', () => {
    const first = generateSudoku({ size: 9, difficulty: 'medium', seed: 'a' });
    const second = generateSudoku({ size: 9, difficulty: 'medium', seed: 'b' });
    expect(first.solution).not.toEqual(second.solution);
  });

  it('sets the correct box dimensions', () => {
    expect(generateSudoku({ size: 4, difficulty: 'easy', seed: 'x' }).boxRows).toBe(2);
    expect(generateSudoku({ size: 6, difficulty: 'easy', seed: 'x' }).boxCols).toBe(3);
    expect(generateSudoku({ size: 9, difficulty: 'easy', seed: 'x' }).boxCols).toBe(3);
  });
});

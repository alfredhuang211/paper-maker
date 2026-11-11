import { describe, expect, it } from 'vitest';
import { generateMaze, MAZE_LINE_WIDTH_MM, MAZE_SIZES } from './engine';

describe('maze engine', () => {
  it.each(MAZE_SIZES)('generates a %ix%i maze within the grid', (size) => {
    const model = generateMaze({ size, lineWeight: 'medium', seed: 'test' });
    expect(model.cols).toBe(size);
    expect(model.rows).toBe(size);
    expect(model.walls.length).toBeGreaterThan(size * 2);
    for (const wall of model.walls) {
      expect(wall.x1).toBeGreaterThanOrEqual(0);
      expect(wall.y1).toBeGreaterThanOrEqual(0);
      expect(wall.x2).toBeLessThanOrEqual(size);
      expect(wall.y2).toBeLessThanOrEqual(size);
      expect(wall.x1 === wall.x2 || wall.y1 === wall.y2).toBe(true);
    }
  });

  it('is deterministic for the same seed', () => {
    const first = generateMaze({ size: 15, lineWeight: 'medium', seed: 'same' });
    const second = generateMaze({ size: 15, lineWeight: 'medium', seed: 'same' });
    expect(first.walls).toEqual(second.walls);
  });

  it('produces a different maze for a different seed', () => {
    const first = generateMaze({ size: 15, lineWeight: 'medium', seed: 'a' });
    const second = generateMaze({ size: 15, lineWeight: 'medium', seed: 'b' });
    expect(first.walls).not.toEqual(second.walls);
  });

  it('keeps the entrance and exit open', () => {
    const size = 10;
    const model = generateMaze({ size, lineWeight: 'medium', seed: 'test' });
    const hasWall = (x1: number, y1: number, x2: number, y2: number) =>
      model.walls.some((wall) => wall.x1 === x1 && wall.y1 === y1 && wall.x2 === x2 && wall.y2 === y2);
    // Top edge of cell (0, 0)
    expect(hasWall(0, 0, 1, 0)).toBe(false);
    // Bottom edge of cell (9, 9)
    expect(hasWall(size - 1, size, size, size)).toBe(false);
  });

  it('maps line weight to millimetres', () => {
    const model = generateMaze({ size: 10, lineWeight: 'thick', seed: 'test' });
    expect(model.lineWidthMm).toBe(MAZE_LINE_WIDTH_MM.thick);
  });
});

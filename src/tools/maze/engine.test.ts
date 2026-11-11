import { describe, expect, it } from 'vitest';
import {
  generateMaze,
  MAZE_LINE_WIDTH_MM,
  MAZE_SHAPES,
  MAZE_SIZES,
  mazeRowsFor,
  type MazeParams,
} from './engine';

const base: MazeParams = {
  size: 15,
  shape: 'square',
  lineWeight: 'medium',
  seed: 'test',
};

const generate = (overrides: Partial<MazeParams> = {}) =>
  generateMaze({ ...base, ...overrides });

describe('maze engine', () => {
  it.each(MAZE_SIZES)('generates a %ix%i square maze within the grid', (size) => {
    const model = generate({ size });
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

  it.each(MAZE_SHAPES)('generates a valid %s maze', (shape) => {
    const model = generate({ shape });
    expect(model.shape).toBe(shape);
    expect(model.cols).toBe(15);
    expect(model.rows).toBe(shape === 'rectangle' ? mazeRowsFor(15, 'rectangle') : 15);
    expect(model.walls.length).toBeGreaterThan(10);
  });

  it('is deterministic for the same seed', () => {
    const first = generate();
    const second = generate();
    expect(first.walls).toEqual(second.walls);
  });

  it('produces a different maze for a different seed', () => {
    const first = generate({ seed: 'a' });
    const second = generate({ seed: 'b' });
    expect(first.walls).not.toEqual(second.walls);
  });

  it('keeps the entrance and exit outer walls open for every shape', () => {
    for (const shape of MAZE_SHAPES) {
      const model = generate({ shape, size: 10 });
      const hasWall = (x1: number, y1: number, x2: number, y2: number) =>
        model.walls.some(
          (wall) => wall.x1 === x1 && wall.y1 === y1 && wall.x2 === x2 && wall.y2 === y2,
        );
      expect(
        hasWall(model.start.x, model.start.y, model.start.x + 1, model.start.y),
      ).toBe(false);
      expect(
        hasWall(
          model.exit.x,
          model.exit.y + 1,
          model.exit.x + 1,
          model.exit.y + 1,
        ),
      ).toBe(false);
    }
  });

  it('maps line weight to millimetres', () => {
    const model = generate({ lineWeight: 'thick' });
    expect(model.lineWidthMm).toBe(MAZE_LINE_WIDTH_MM.thick);
  });
});

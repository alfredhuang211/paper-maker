import { createRng } from '../../core/random';

export type MazeSize = 10 | 15 | 20 | 30;
export type MazeLineWeight = 'thin' | 'medium' | 'thick';

export const MAZE_SIZES: MazeSize[] = [10, 15, 20, 30];

export const MAZE_LINE_WIDTH_MM: Record<MazeLineWeight, number> = {
  thin: 0.35,
  medium: 0.5,
  thick: 0.7,
};

export interface MazeParams {
  size: MazeSize;
  lineWeight: MazeLineWeight;
  seed: string;
}

export interface MazeWall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface MazeModel {
  cols: number;
  rows: number;
  walls: MazeWall[];
  lineWidthMm: number;
}

interface Cell {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

const DIRECTIONS = [
  { dx: 0, dy: -1, wall: 'top' as const, opposite: 'bottom' as const },
  { dx: 1, dy: 0, wall: 'right' as const, opposite: 'left' as const },
  { dx: 0, dy: 1, wall: 'bottom' as const, opposite: 'top' as const },
  { dx: -1, dy: 0, wall: 'left' as const, opposite: 'right' as const },
];

/**
 * Recursive-backtracker maze. All cells are connected; the outer wall has one
 * opening at the top-left entrance and one at the bottom-right exit.
 */
export function generateMaze(params: MazeParams): MazeModel {
  const size = params.size;
  const cols = size;
  const rows = size;
  const rng = createRng(`${params.seed}|maze|${size}`);
  const cells: Cell[] = Array.from({ length: cols * rows }, () => ({
    top: true,
    right: true,
    bottom: true,
    left: true,
  }));
  const visited = new Uint8Array(cols * rows);
  const stack: number[] = [0];
  visited[0] = 1;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const x = current % cols;
    const y = Math.floor(current / cols);
    const candidates: { index: number; dx: number; dy: number }[] = [];

    for (const direction of DIRECTIONS) {
      const nx = x + direction.dx;
      const ny = y + direction.dy;
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
      const index = ny * cols + nx;
      if (!visited[index]) candidates.push({ index, dx: direction.dx, dy: direction.dy });
    }

    if (candidates.length === 0) {
      stack.pop();
      continue;
    }

    const next = rng.pick(candidates);
    const direction = DIRECTIONS.find(
      (item) => item.dx === next.dx && item.dy === next.dy,
    );
    if (!direction) break;
    cells[current][direction.wall] = false;
    cells[next.index][direction.opposite] = false;
    visited[next.index] = 1;
    stack.push(next.index);
  }

  // Open the top-left entrance and the bottom-right exit.
  cells[0].top = false;
  cells[cols * rows - 1].bottom = false;

  const walls: MazeWall[] = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const cell = cells[y * cols + x];
      if (cell.top) walls.push({ x1: x, y1: y, x2: x + 1, y2: y });
      if (cell.left) walls.push({ x1: x, y1: y, x2: x, y2: y + 1 });
      if (x === cols - 1 && cell.right) {
        walls.push({ x1: x + 1, y1: y, x2: x + 1, y2: y + 1 });
      }
      if (y === rows - 1 && cell.bottom) {
        walls.push({ x1: x, y1: y + 1, x2: x + 1, y2: y + 1 });
      }
    }
  }

  return {
    cols,
    rows,
    walls,
    lineWidthMm: MAZE_LINE_WIDTH_MM[params.lineWeight],
  };
}

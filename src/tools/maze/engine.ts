import { createRng } from '../../core/random';

export type MazeSize = 10 | 15 | 20 | 30;
export type MazeShape = 'square' | 'rectangle' | 'circle' | 'triangle';
export type MazeLineWeight = 'thin' | 'medium' | 'thick';

export const MAZE_SIZES: MazeSize[] = [10, 15, 20, 30];
export const MAZE_SHAPES: MazeShape[] = ['square', 'rectangle', 'circle', 'triangle'];

export const MAZE_LINE_WIDTH_MM: Record<MazeLineWeight, number> = {
  thin: 0.35,
  medium: 0.5,
  thick: 0.7,
};

export interface MazeParams {
  size: MazeSize;
  shape: MazeShape;
  lineWeight: MazeLineWeight;
  seed: string;
}

export interface MazeWall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface MazeCellPosition {
  x: number;
  y: number;
}

export interface MazeModel {
  cols: number;
  rows: number;
  shape: MazeShape;
  walls: MazeWall[];
  start: MazeCellPosition;
  exit: MazeCellPosition;
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

export function mazeRowsFor(size: MazeSize, shape: MazeShape): number {
  if (shape === 'rectangle') return Math.max(6, Math.round(size * 0.65));
  return size;
}

function pointInTriangle(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): boolean {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNegative && hasPositive);
}

function isValidCell(shape: MazeShape, x: number, y: number, cols: number, rows: number): boolean {
  if (shape === 'circle') {
    const cx = cols / 2;
    const cy = rows / 2;
    const radius = Math.min(cols, rows) / 2 - 0.2;
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cy;
    return dx * dx + dy * dy <= radius * radius;
  }
  if (shape === 'triangle') {
    // Upward triangle: apex at top center, base along the bottom.
    return pointInTriangle(
      x + 0.5,
      y + 0.5,
      cols / 2,
      0,
      0,
      rows,
      cols,
      rows,
    );
  }
  return true;
}

/**
 * Recursive-backtracker maze. All valid cells are connected; the outer wall has
 * one opening at the top entrance cell and one at the bottom exit cell.
 */
export function generateMaze(params: MazeParams): MazeModel {
  const cols = params.size;
  const rows = mazeRowsFor(params.size, params.shape);
  const rng = createRng(`${params.seed}|maze|${params.shape}|${params.size}`);
  const valid = new Uint8Array(cols * rows);
  const cells: Cell[] = Array.from({ length: cols * rows }, () => ({
    top: true,
    right: true,
    bottom: true,
    left: true,
  }));

  const validIndices: number[] = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (isValidCell(params.shape, x, y, cols, rows)) {
        valid[y * cols + x] = 1;
        validIndices.push(y * cols + x);
      }
    }
  }

  // Narrowest rows form the entry/exit boundaries of circle/triangle shapes.
  const minY = Math.min(...validIndices.map((index) => Math.floor(index / cols)));
  const maxY = Math.max(...validIndices.map((index) => Math.floor(index / cols)));
  const pickCenter = (indices: number[]) =>
    indices.reduce((best, index) => {
      const x = (index % cols) + 0.5;
      const bestX = (best % cols) + 0.5;
      return Math.abs(x - cols / 2) < Math.abs(bestX - cols / 2) ? index : best;
    }, indices[0]);
  const startIndex = pickCenter(
    validIndices.filter((index) => Math.floor(index / cols) === minY),
  );
  const exitIndex = pickCenter(
    validIndices.filter((index) => Math.floor(index / cols) === maxY),
  );

  const visited = new Uint8Array(cols * rows);
  const stack: number[] = [startIndex];
  visited[startIndex] = 1;

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
      if (!valid[index] || visited[index]) continue;
      candidates.push({ index, dx: direction.dx, dy: direction.dy });
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

  // Open the entrance and exit cells.
  cells[startIndex].top = false;
  cells[exitIndex].bottom = false;

  const walls: MazeWall[] = [];
  for (const index of validIndices) {
    const x = index % cols;
    const y = Math.floor(index / cols);
    const cell = cells[index];
    if (cell.top) walls.push({ x1: x, y1: y, x2: x + 1, y2: y });
    if (cell.left) walls.push({ x1: x, y1: y, x2: x, y2: y + 1 });
    if ((x === cols - 1 || !valid[index + 1]) && cell.right) {
      walls.push({ x1: x + 1, y1: y, x2: x + 1, y2: y + 1 });
    }
    if ((y === rows - 1 || !valid[index + cols]) && cell.bottom) {
      walls.push({ x1: x, y1: y + 1, x2: x + 1, y2: y + 1 });
    }
  }

  const startY = Math.floor(startIndex / cols);
  const startX = startIndex % cols;
  const exitY = Math.floor(exitIndex / cols);
  const exitX = exitIndex % cols;

  return {
    cols,
    rows,
    shape: params.shape,
    walls,
    start: { x: startX, y: startY },
    exit: { x: exitX, y: exitY },
    lineWidthMm: MAZE_LINE_WIDTH_MM[params.lineWeight],
  };
}

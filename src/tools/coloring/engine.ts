import { createRng, type Rng } from '../../core/random';

export type ColoringTheme = 'symmetry' | 'mandala' | 'geometric';
export type LineWeight = 'thin' | 'medium' | 'thick';

export interface ColoringParams {
  theme: ColoringTheme;
  complexity: number;
  lineWeight: LineWeight;
  seed: string;
}

export type ColoringElement =
  | { kind: 'path'; d: string }
  | { kind: 'circle'; cx: number; cy: number; r: number };

export interface ColoringModel {
  width: number;
  height: number;
  strokeWidth: number;
  elements: ColoringElement[];
}

export const LINE_WIDTH_MM: Record<LineWeight, number> = {
  thin: 0.3,
  medium: 0.5,
  thick: 1.0,
};

const WIDTH = 180;
const HEIGHT = 232;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const TWO_PI = Math.PI * 2;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function point(radius: number, angle: number): [number, number] {
  return [round(CX + Math.cos(angle) * radius), round(CY + Math.sin(angle) * radius)];
}

function petalPath(inner: number, outer: number, angle: number, spread: number): string {
  const [x0, y0] = point(inner, angle - spread);
  const [x1, y1] = point(inner, angle + spread);
  const [tx, ty] = point(outer, angle);
  const [c1x, c1y] = point(inner + (outer - inner) * 0.55, angle - spread * 1.7);
  const [c2x, c2y] = point(inner + (outer - inner) * 0.55, angle + spread * 1.7);
  return `M ${x0} ${y0} Q ${c1x} ${c1y} ${tx} ${ty} Q ${c2x} ${c2y} ${x1} ${y1} Z`;
}

function linePath(from: number, to: number, angle: number): string {
  const [x0, y0] = point(from, angle);
  const [x1, y1] = point(to, angle);
  return `M ${x0} ${y0} L ${x1} ${y1}`;
}

function mandala(rng: Rng, complexity: number): ColoringElement[] {
  const elements: ColoringElement[] = [];
  const rings = 3 + complexity;
  const petals = 6 + complexity * 2;
  const maxRadius = 82;
  const minRadius = 15;

  elements.push({ kind: 'circle', cx: CX, cy: CY, r: 4 });
  elements.push({ kind: 'circle', cx: CX, cy: CY, r: 10 });

  for (let ring = 0; ring < rings; ring += 1) {
    const radius = minRadius + ((maxRadius - minRadius) * (ring + 1)) / rings;
    const nextRadius = Math.min(maxRadius + 6, radius + (maxRadius - minRadius) / rings + 5);
    const spread = (TWO_PI / petals) * (0.24 + rng.next() * 0.08);
    const offset = ring % 2 === 0 ? 0 : Math.PI / petals;

    elements.push({ kind: 'circle', cx: CX, cy: CY, r: round(radius) });

    for (let index = 0; index < petals; index += 1) {
      const angle = (index / petals) * TWO_PI + offset;
      elements.push({
        kind: 'path',
        d: petalPath(radius * 0.96, nextRadius, angle, spread),
      });

      if (ring === rings - 1) {
        const [dx, dy] = point(nextRadius, angle);
        elements.push({ kind: 'circle', cx: dx, cy: dy, r: 1.3 });
      }
    }

    for (let index = 0; index < petals; index += 1) {
      const angle = ((index + 0.5) / petals) * TWO_PI + offset;
      elements.push({ kind: 'path', d: linePath(radius, nextRadius, angle) });
    }
  }

  return elements;
}

function symmetry(rng: Rng, complexity: number): ColoringElement[] {
  const elements: ColoringElement[] = [];
  const folds = 4 + complexity * 2;
  const layers = 2 + Math.floor(complexity / 2);
  const baseRadius = 12;

  elements.push({ kind: 'circle', cx: CX, cy: CY, r: 6 });
  elements.push({ kind: 'circle', cx: CX, cy: CY, r: 16 });
  elements.push({
    kind: 'path',
    d: `M ${CX - 78} ${CY} L ${CX} ${CY - 78} L ${CX + 78} ${CY} L ${CX} ${CY + 78} Z`,
  });

  for (let layer = 0; layer < layers; layer += 1) {
    const inner = baseRadius + layer * 15;
    const outer = inner + 22 + rng.int(0, 10);
    const spread = (TWO_PI / folds) * 0.32;
    const offset = layer * (Math.PI / folds);

    for (let index = 0; index < folds; index += 1) {
      const angle = (index / folds) * TWO_PI + offset;
      elements.push({ kind: 'path', d: petalPath(inner, outer, angle, spread) });
      const [x1, y1] = point(outer, angle);
      const [x2, y2] = point(outer + 9, angle);
      elements.push({ kind: 'path', d: `M ${x1} ${y1} L ${x2} ${y2}` });
    }

    for (let index = 0; index < folds; index += 1) {
      const angle = ((index + 0.5) / folds) * TWO_PI + offset;
      elements.push({ kind: 'path', d: linePath(inner, outer + 9, angle) });
    }

    elements.push({ kind: 'circle', cx: CX, cy: CY, r: round(outer) });
  }

  return elements;
}

function geometric(rng: Rng, complexity: number): ColoringElement[] {
  const elements: ColoringElement[] = [];
  const marginX = 8;
  const marginY = 10;
  const columns = 3 + complexity;
  const rows = 4 + complexity;
  const cellWidth = (WIDTH - marginX * 2) / columns;
  const cellHeight = (HEIGHT - marginY * 2) / rows;

  elements.push({
    kind: 'path',
    d: `M ${marginX} ${marginY} L ${WIDTH - marginX} ${marginY} L ${WIDTH - marginX} ${HEIGHT - marginY} L ${marginX} ${HEIGHT - marginY} Z`,
  });

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = marginX + column * cellWidth;
      const y = marginY + row * cellHeight;
      const mode = rng.int(0, 3);
      const inset = Math.min(cellWidth, cellHeight) * (0.16 + rng.next() * 0.1);

      if (mode === 0) {
        elements.push({
          kind: 'path',
          d: `M ${round(x)} ${round(y)} L ${round(x + cellWidth)} ${round(y)} L ${round(x)} ${round(y + cellHeight)} Z`,
        });
      } else if (mode === 1) {
        elements.push({
          kind: 'path',
          d: `M ${round(x + cellWidth)} ${round(y + cellHeight)} L ${round(x)} ${round(y + cellHeight)} L ${round(x + cellWidth)} ${round(y)} Z`,
        });
      } else if (mode === 2) {
        elements.push({
          kind: 'path',
          d: `M ${round(x + inset)} ${round(y + cellHeight * 0.5)} L ${round(x + cellWidth * 0.5)} ${round(y + inset)} L ${round(x + cellWidth - inset)} ${round(y + cellHeight * 0.5)} L ${round(x + cellWidth * 0.5)} ${round(y + cellHeight - inset)} Z`,
        });
      } else {
        elements.push({
          kind: 'circle',
          cx: round(x + cellWidth / 2),
          cy: round(y + cellHeight / 2),
          r: round(Math.min(cellWidth, cellHeight) * 0.28),
        });
      }

      if (rng.next() < 0.35) {
        elements.push({
          kind: 'path',
          d: `M ${round(x)} ${round(y + cellHeight)} L ${round(x + cellWidth)} ${round(y)}`,
        });
      }
    }
  }

  return elements;
}

export function generateColoring(params: ColoringParams): ColoringModel {
  const complexity = Math.max(1, Math.min(5, Math.round(params.complexity)));
  const rng = createRng(`${params.seed}|coloring|${params.theme}|${complexity}`);
  const elements =
    params.theme === 'mandala'
      ? mandala(rng, complexity)
      : params.theme === 'symmetry'
        ? symmetry(rng, complexity)
        : geometric(rng, complexity);

  return {
    width: WIDTH,
    height: HEIGHT,
    strokeWidth: LINE_WIDTH_MM[params.lineWeight],
    elements,
  };
}

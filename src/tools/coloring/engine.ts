import { createRng, type Rng } from '../../core/random';

export type ColoringTheme =
  | 'symmetry'
  | 'mandala'
  | 'geometric'
  | 'kaleidoscope'
  | 'stainedGlass'
  | 'waves'
  | 'skyline';
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


function polygonPath(points: [number, number][]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  return `M ${first[0]} ${first[1]} ${rest.map(([x, y]) => `L ${x} ${y}`).join(' ')} Z`;
}

function rectPath(x: number, y: number, width: number, height: number): string {
  return `M ${round(x)} ${round(y)} L ${round(x + width)} ${round(y)} L ${round(x + width)} ${round(y + height)} L ${round(x)} ${round(y + height)} Z`;
}

function kaleidoscope(rng: Rng, complexity: number): ColoringElement[] {
  const elements: ColoringElement[] = [];
  const folds = 8 + complexity * 2;
  const rings = 3 + Math.floor(complexity / 2);
  const minRadius = 14;
  const maxRadius = 85;

  elements.push({ kind: 'circle', cx: CX, cy: CY, r: 4 });
  elements.push({ kind: 'circle', cx: CX, cy: CY, r: 10 });

  const star = Array.from({ length: folds }, (_, index) => {
    const angle = (index / folds) * TWO_PI - Math.PI / 2;
    return point(index % 2 === 0 ? 21 : 9, angle);
  });
  elements.push({ kind: 'path', d: polygonPath(star) });

  for (let ring = 0; ring < rings; ring += 1) {
    const radius = minRadius + ((maxRadius - minRadius) * ring) / rings;
    const outer = minRadius + ((maxRadius - minRadius) * (ring + 1)) / rings;
    const step = TWO_PI / folds;
    const offset = ring % 2 === 0 ? 0 : step / 2;
    const spread = step * (0.25 + rng.next() * 0.07);

    for (let index = 0; index < folds; index += 1) {
      const angle = index * step + offset;
      const [x0, y0] = point(radius, angle - spread);
      const [x1, y1] = point(radius, angle + spread);
      const [tipX, tipY] = point(outer, angle);
      elements.push({
        kind: 'path',
        d: `M ${x0} ${y0} L ${tipX} ${tipY} L ${x1} ${y1} Z`,
      });

      const [ix0, iy0] = point(radius * 0.86, angle);
      const [ix1, iy1] = point((radius + outer) / 2, angle + spread * 0.58);
      const [ix2, iy2] = point(outer * 0.86, angle);
      const [ix3, iy3] = point((radius + outer) / 2, angle - spread * 0.58);
      elements.push({
        kind: 'path',
        d: `M ${ix0} ${iy0} L ${ix1} ${iy1} L ${ix2} ${iy2} L ${ix3} ${iy3} Z`,
      });

      if (rng.next() < 0.35) {
        const [dotX, dotY] = point(outer, angle);
        elements.push({ kind: 'circle', cx: dotX, cy: dotY, r: 1.8 });
      }
    }

    elements.push({ kind: 'circle', cx: CX, cy: CY, r: round(outer) });
  }

  elements.push({ kind: 'circle', cx: CX, cy: CY, r: maxRadius + 4 });
  return elements;
}

function stainedGlass(rng: Rng, complexity: number): ColoringElement[] {
  const elements: ColoringElement[] = [];
  const margin = 10;
  const columns = 4 + complexity;
  const rows = 6 + complexity;
  const cellWidth = (WIDTH - margin * 2) / columns;
  const cellHeight = (HEIGHT - margin * 2) / rows;
  const jitter = Math.min(cellWidth, cellHeight) * (0.24 + complexity * 0.012);
  const vertices: [number, number][][] = [];

  for (let row = 0; row <= rows; row += 1) {
    const current: [number, number][] = [];
    for (let column = 0; column <= columns; column += 1) {
      const edge = row === 0 || row === rows || column === 0 || column === columns;
      const x = margin + column * cellWidth + (edge ? 0 : (rng.next() * 2 - 1) * jitter);
      const y = margin + row * cellHeight + (edge ? 0 : (rng.next() * 2 - 1) * jitter);
      current.push([round(x), round(y)]);
    }
    vertices.push(current);
  }

  const borderRadius = 9;
  elements.push({
    kind: 'path',
    d: `M ${margin + borderRadius} ${margin} L ${WIDTH - margin - borderRadius} ${margin} Q ${WIDTH - margin} ${margin} ${WIDTH - margin} ${margin + borderRadius} L ${WIDTH - margin} ${HEIGHT - margin - borderRadius} Q ${WIDTH - margin} ${HEIGHT - margin} ${WIDTH - margin - borderRadius} ${HEIGHT - margin} L ${margin + borderRadius} ${HEIGHT - margin} Q ${margin} ${HEIGHT - margin} ${margin} ${HEIGHT - margin - borderRadius} L ${margin} ${margin + borderRadius} Q ${margin} ${margin} ${margin + borderRadius} ${margin} Z`,
  });

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const a = vertices[row][column];
      const b = vertices[row][column + 1];
      const c = vertices[row + 1][column + 1];
      const d = vertices[row + 1][column];
      elements.push({ kind: 'path', d: polygonPath([a, b, c, d]) });

      if (rng.next() < 0.24) {
        const fromTop = rng.next() < 0.5;
        const p1 = fromTop ? a : d;
        const p2 = fromTop ? c : b;
        elements.push({
          kind: 'path',
          d: `M ${p1[0]} ${p1[1]} L ${round((p1[0] + p2[0]) / 2 + (rng.next() * 2 - 1) * 5)} ${round((p1[1] + p2[1]) / 2 + (rng.next() * 2 - 1) * 5)} L ${p2[0]} ${p2[1]}`,
        });
      }
    }
  }

  return elements;
}

function wavePoints(
  baseY: number,
  amplitude: number,
  frequency: number,
  phase: number,
  offset: number,
): [number, number][] {
  const points: [number, number][] = [];
  const step = 4;
  for (let x = 10; x <= WIDTH - 10; x += step) {
    const y = baseY + offset + Math.sin(x * frequency + phase) * amplitude;
    points.push([round(x), round(y)]);
  }
  return points;
}

function pathFromPoints(points: [number, number][]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  return `M ${first[0]} ${first[1]} ${rest.map(([x, y]) => `L ${x} ${y}`).join(' ')}`;
}

function closedWaveBand(
  baseY: number,
  amplitude: number,
  frequency: number,
  phase: number,
  height: number,
): string {
  const top = wavePoints(baseY, amplitude, frequency, phase, 0);
  const bottom = wavePoints(baseY, amplitude, frequency, phase, height).reverse();
  return `${pathFromPoints(top)} L ${bottom[0][0]} ${bottom[0][1]} ${bottom
    .slice(1)
    .map(([x, y]) => `L ${x} ${y}`)
    .join(' ')} Z`;
}

function fishPath(x: number, y: number, scale: number): string {
  return `M ${round(x - 7 * scale)} ${round(y)} C ${round(x - 3 * scale)} ${round(y - 4 * scale)} ${round(x + 5 * scale)} ${round(y - 4 * scale)} ${round(x + 8 * scale)} ${round(y)} C ${round(x + 5 * scale)} ${round(y + 4 * scale)} ${round(x - 3 * scale)} ${round(y + 4 * scale)} ${round(x - 7 * scale)} ${round(y)} Z M ${round(x - 7 * scale)} ${round(y)} L ${round(x - 12 * scale)} ${round(y - 4 * scale)} L ${round(x - 11 * scale)} ${round(y)} L ${round(x - 12 * scale)} ${round(y + 4 * scale)} Z`;
}

function waves(rng: Rng, complexity: number): ColoringElement[] {
  const elements: ColoringElement[] = [];
  const sunX = CX;
  const sunY = 45;
  const sunRadius = 16;

  elements.push({ kind: 'circle', cx: sunX, cy: sunY, r: sunRadius });
  elements.push({ kind: 'circle', cx: sunX, cy: sunY, r: sunRadius * 0.58 });
  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * TWO_PI;
    const inner = sunRadius + 4;
    const outer = sunRadius + 10 + (index % 2 === 0 ? 3 : 0);
    const p1 = [round(sunX + Math.cos(angle) * inner), round(sunY + Math.sin(angle) * inner)];
    const p2 = [round(sunX + Math.cos(angle) * outer), round(sunY + Math.sin(angle) * outer)];
    elements.push({ kind: 'path', d: `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]}` });
  }

  const top = 74;
  const bottom = HEIGHT - 12;
  const bands = 4 + complexity;
  const bandHeight = (bottom - top) / bands;

  for (let band = 0; band < bands; band += 1) {
    const baseY = top + band * bandHeight;
    const amplitude = 2.5 + rng.next() * 3.5;
    const frequency = 0.022 + rng.next() * 0.018;
    const phase = rng.next() * TWO_PI;
    const innerHeight = bandHeight * 0.92;

    elements.push({
      kind: 'path',
      d: closedWaveBand(baseY, amplitude, frequency, phase, innerHeight),
    });
    for (let line = 1; line <= 2; line += 1) {
      elements.push({
        kind: 'path',
        d: pathFromPoints(
          wavePoints(
            baseY,
            amplitude,
            frequency,
            phase + line * 0.42,
            (innerHeight * line) / 3,
          ),
        ),
      });
    }
  }

  const fishCount = 2 + complexity;
  for (let index = 0; index < fishCount; index += 1) {
    const x = 25 + rng.next() * (WIDTH - 50);
    const y = top + 18 + rng.next() * (bottom - top - 36);
    const scale = 0.7 + rng.next() * 0.6;
    elements.push({ kind: 'path', d: fishPath(x, y, scale) });
    elements.push({ kind: 'circle', cx: round(x + 4 * scale), cy: round(y - 1), r: 0.7 });
  }

  return elements;
}

function skyline(rng: Rng, complexity: number): ColoringElement[] {
  const elements: ColoringElement[] = [];
  const ground = HEIGHT - 18;
  const margin = 10;

  elements.push({ kind: 'circle', cx: 144, cy: 42, r: 13 });
  elements.push({ kind: 'circle', cx: 144, cy: 42, r: 7 });
  for (let index = 0; index < 7; index += 1) {
    elements.push({
      kind: 'circle',
      cx: round(18 + rng.next() * 120),
      cy: round(18 + rng.next() * 48),
      r: 0.8 + rng.next() * 0.7,
    });
  }

  elements.push({
    kind: 'path',
    d: `M ${margin} ${ground} Q 45 ${ground - 26} 80 ${ground - 6} Q 118 ${ground - 32} 170 ${ground} Z`,
  });

  let x = margin;
  const maxHeight = 58 + complexity * 9;
  while (x < WIDTH - margin - 12) {
    const width = 13 + rng.int(0, 13);
    if (x + width > WIDTH - margin) break;
    const height = 30 + rng.next() * maxHeight;
    const y = ground - height;
    const roof = rng.int(0, 3);

    elements.push({ kind: 'path', d: rectPath(x, y, width, height) });
    if (roof === 0) {
      elements.push({
        kind: 'path',
        d: `M ${round(x)} ${round(y)} L ${round(x + width / 2)} ${round(y - 8)} L ${round(x + width)} ${round(y)}`,
      });
    } else if (roof === 1) {
      elements.push({
        kind: 'path',
        d: `M ${round(x)} ${round(y)} L ${round(x + width / 2)} ${round(y - 4)} L ${round(x + width)} ${round(y)}`,
      });
    }

    const windowColumns = Math.max(1, Math.floor((width - 5) / 7));
    const windowRows = Math.min(4, Math.max(1, Math.floor((height - 8) / 12)));
    for (let row = 0; row < windowRows; row += 1) {
      for (let column = 0; column < windowColumns; column += 1) {
        if (rng.next() < 0.18) continue;
        const wx = x + 3 + column * ((width - 6) / windowColumns);
        const wy = y + 5 + row * ((height - 10) / windowRows);
        elements.push({ kind: 'path', d: rectPath(wx, wy, 3, 4) });
      }
    }

    if (height > 70 && rng.next() < 0.35) {
      elements.push({
        kind: 'path',
        d: `M ${round(x + width / 2)} ${round(y)} L ${round(x + width / 2)} ${round(y - 13)}`,
      });
      elements.push({ kind: 'circle', cx: round(x + width / 2), cy: round(y - 15), r: 1 });
    }

    x += width + 2 + rng.int(0, 4);
  }

  elements.push({
    kind: 'path',
    d: `M ${margin} ${ground} L ${WIDTH - margin} ${ground}`,
  });
  for (let xLine = 14; xLine < WIDTH - margin; xLine += 14) {
    elements.push({
      kind: 'path',
      d: `M ${xLine} ${ground + 4} L ${xLine + 7} ${ground + 4}`,
    });
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
        : params.theme === 'kaleidoscope'
          ? kaleidoscope(rng, complexity)
          : params.theme === 'stainedGlass'
            ? stainedGlass(rng, complexity)
            : params.theme === 'waves'
              ? waves(rng, complexity)
              : params.theme === 'skyline'
                ? skyline(rng, complexity)
                : geometric(rng, complexity);

  return {
    width: WIDTH,
    height: HEIGHT,
    strokeWidth: LINE_WIDTH_MM[params.lineWeight],
    elements,
  };
}

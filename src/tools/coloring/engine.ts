import { createRng, type Rng } from '../../core/random';

export type ColoringTheme =
  | 'symmetry'
  | 'mandala'
  | 'geometric'
  | 'kaleidoscope'
  | 'stainedGlass'
  | 'waves'
  | 'skyline'
  | 'landscape'
  | 'botanical'
  | 'space'
  | 'underwater';
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


function localPoint(cx: number, cy: number, radius: number, angle: number): [number, number] {
  return [round(cx + Math.cos(angle) * radius), round(cy + Math.sin(angle) * radius)];
}

function localPetal(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  angle: number,
  spread: number,
): string {
  const [x0, y0] = localPoint(cx, cy, inner, angle - spread);
  const [x1, y1] = localPoint(cx, cy, inner, angle + spread);
  const [tx, ty] = localPoint(cx, cy, outer, angle);
  const [c1x, c1y] = localPoint(cx, cy, inner + (outer - inner) * 0.58, angle - spread * 1.8);
  const [c2x, c2y] = localPoint(cx, cy, inner + (outer - inner) * 0.58, angle + spread * 1.8);
  return `M ${x0} ${y0} Q ${c1x} ${c1y} ${tx} ${ty} Q ${c2x} ${c2y} ${x1} ${y1} Z`;
}

function leafPath(x: number, y: number, length: number, angle: number, width: number): string {
  const [x1, y1] = localPoint(x, y, length, angle);
  const [nx, ny] = localPoint(0, 0, width, angle + Math.PI / 2);
  const [mx, my] = localPoint(x, y, length * 0.48, angle);
  return `M ${x} ${y} Q ${round(mx + nx)} ${round(my + ny)} ${x1} ${y1} Q ${round(mx - nx)} ${round(my - ny)} ${x} ${y} Z`;
}

function landscape(rng: Rng, complexity: number): ColoringElement[] {
  const elements: ColoringElement[] = [];
  const horizon = 190;
  const sunX = 145;
  const sunY = 42;

  elements.push({ kind: 'circle', cx: sunX, cy: sunY, r: 13 });
  for (let index = 0; index < 9; index += 1) {
    const angle = (index / 9) * TWO_PI;
    const inner = 18;
    const outer = 24 + (index % 2 === 0 ? 3 : 0);
    const p1 = localPoint(sunX, sunY, inner, angle);
    const p2 = localPoint(sunX, sunY, outer, angle);
    elements.push({ kind: 'path', d: `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]}` });
  }

  const clouds = 2 + Math.floor(complexity / 2);
  for (let index = 0; index < clouds; index += 1) {
    const x = 18 + rng.next() * 80;
    const y = 28 + rng.next() * 38;
    const width = 18 + rng.next() * 18;
    elements.push({
      kind: 'path',
      d: `M ${round(x)} ${round(y + 8)} Q ${round(x + 2)} ${round(y)} ${round(x + width * 0.35)} ${round(y + 4)} Q ${round(x + width * 0.55)} ${round(y - 5)} ${round(x + width * 0.72)} ${round(y + 2)} Q ${round(x + width)} ${round(y)} ${round(x + width)} ${round(y + 9)} Q ${round(x + width * 0.7)} ${round(y + 14)} ${round(x + width * 0.35)} ${round(y + 10)} Q ${round(x)} ${round(y + 14)} ${round(x)} ${round(y + 8)} Z`,
    });
  }

  const layers = 2 + Math.floor(complexity / 2);
  for (let layer = 0; layer < layers; layer += 1) {
    const back = layers - layer;
    const peaks = 3 + Math.floor(complexity / 2);
    const points: [number, number][] = [[10, horizon]];
    for (let index = 0; index <= peaks; index += 1) {
      const x = 10 + ((WIDTH - 20) * index) / peaks;
      const variation = (rng.next() * 2 - 1) * 12;
      const y = horizon - 34 - back * 16 - rng.next() * 26 + variation;
      points.push([round(x), round(Math.max(58, y))]);
    }
    points.push([WIDTH - 10, horizon]);
    elements.push({ kind: 'path', d: polygonPath(points) });
  }

  elements.push({
    kind: 'path',
    d: `M 10 ${horizon} Q 55 ${horizon - 10} 90 ${horizon} Q 130 ${horizon + 10} 170 ${horizon} L 170 220 L 10 220 Z`,
  });
  for (let line = 0; line < 4; line += 1) {
    const y = 202 + line * 5;
    elements.push({
      kind: 'path',
      d: `M 10 ${y} Q 55 ${y - 3} 90 ${y} Q 130 ${y + 3} 170 ${y}`,
    });
  }

  const tree = (x: number, height: number) => {
    const base = horizon - 2;
    elements.push({
      kind: 'path',
      d: `M ${x} ${base} L ${x} ${round(base - height * 0.35)}`,
    });
    for (let tier = 0; tier < 3; tier += 1) {
      const y = base - height * (0.28 + tier * 0.2);
      const half = height * (0.26 - tier * 0.05);
      elements.push({
        kind: 'path',
        d: `M ${round(x)} ${round(y - height * 0.3)} L ${round(x - half)} ${round(y)} L ${round(x + half)} ${round(y)} Z`,
      });
    }
  };
  tree(28, 42 + rng.next() * 14);
  tree(152, 38 + rng.next() * 18);
  if (complexity >= 4) tree(54, 28 + rng.next() * 10);

  for (let index = 0; index < 2 + complexity; index += 1) {
    const x = 35 + rng.next() * 90;
    const y = 40 + rng.next() * 35;
    elements.push({
      kind: 'path',
      d: `M ${round(x)} ${round(y)} Q ${round(x + 4)} ${round(y - 3)} ${round(x + 8)} ${round(y)} M ${round(x + 10)} ${round(y + 1)} Q ${round(x + 14)} ${round(y - 2)} ${round(x + 18)} ${round(y + 1)}`,
    });
  }

  return elements;
}

function botanical(rng: Rng, complexity: number): ColoringElement[] {
  const elements: ColoringElement[] = [];
  const ground = 212;
  const flowers = 4 + complexity;
  const span = WIDTH - 30;

  elements.push({
    kind: 'path',
    d: `M 12 ${ground} Q 50 ${ground - 8} 90 ${ground} Q 130 ${ground + 8} 168 ${ground}`,
  });

  for (let index = 0; index < flowers; index += 1) {
    const x = 18 + (span * (index + 0.5)) / flowers + (rng.next() * 2 - 1) * 5;
    const y = 58 + rng.next() * 86;
    const radius = 7 + rng.next() * 4;
    const petals = 5 + Math.floor(complexity * 0.8);
    const stemControl = x + (rng.next() * 2 - 1) * 12;

    elements.push({
      kind: 'path',
      d: `M ${round(x)} ${ground} Q ${round(stemControl)} ${round((ground + y) / 2)} ${round(x)} ${round(y + radius * 0.5)}`,
    });

    const leaves = 1 + Math.floor(rng.next() * 2);
    for (let leaf = 0; leaf < leaves; leaf += 1) {
      const t = 0.3 + leaf * 0.25;
      const lx = x + (stemControl - x) * t;
      const ly = ground - (ground - y) * t;
      const angle = leaf % 2 === 0 ? -0.5 : Math.PI + 0.5;
      elements.push({
        kind: 'path',
        d: leafPath(round(lx), round(ly), 12 + rng.next() * 8, angle, 4 + rng.next() * 2),
      });
    }

    for (let petal = 0; petal < petals; petal += 1) {
      const angle = (petal / petals) * TWO_PI + rng.next() * 0.18;
      elements.push({
        kind: 'path',
        d: localPetal(x, y, radius * 0.72, radius * 1.75, angle, (TWO_PI / petals) * 0.3),
      });
    }
    elements.push({ kind: 'circle', cx: round(x), cy: round(y), r: round(radius * 0.36) });
  }

  for (let index = 0; index < 8 + complexity * 3; index += 1) {
    const x = 14 + rng.next() * 152;
    const y = ground - rng.next() * 14;
    elements.push({
      kind: 'path',
      d: `M ${round(x)} ${round(y)} L ${round(x + (rng.next() * 2 - 1) * 5)} ${round(y - 5 - rng.next() * 5)}`,
    });
  }

  return elements;
}

function space(rng: Rng, complexity: number): ColoringElement[] {
  const elements: ColoringElement[] = [];
  const planetX = 90;
  const planetY = 112;
  const planetRadius = 32;

  elements.push({ kind: 'circle', cx: planetX, cy: planetY, r: planetRadius });
  elements.push({ kind: 'circle', cx: planetX, cy: planetY, r: planetRadius * 0.72 });
  for (let index = 0; index < 3 + complexity; index += 1) {
    const angle = rng.next() * TWO_PI;
    const distance = rng.next() * planetRadius * 0.62;
    const [cx, cy] = localPoint(planetX, planetY, distance, angle);
    elements.push({ kind: 'circle', cx, cy, r: 2 + rng.next() * 3 });
  }

  elements.push({
    kind: 'path',
    d: `M ${planetX - 58} ${planetY - 8} Q ${planetX} ${planetY - 42} ${planetX + 58} ${planetY - 8}`,
  });
  elements.push({
    kind: 'path',
    d: `M ${planetX - 58} ${planetY + 8} Q ${planetX} ${planetY + 42} ${planetX + 58} ${planetY + 8}`,
  });

  const smallPlanets = 3 + Math.floor(complexity / 2);
  const anchors: [number, number][] = [
    [32, 42],
    [150, 48],
    [156, 174],
    [32, 190],
    [118, 28],
    [52, 160],
  ];
  for (let index = 0; index < smallPlanets; index += 1) {
    const [baseX, baseY] = anchors[index % anchors.length];
    const cx = baseX + (rng.next() * 2 - 1) * 10;
    const cy = baseY + (rng.next() * 2 - 1) * 8;
    const radius = 5 + rng.next() * 6;
    elements.push({ kind: 'circle', cx: round(cx), cy: round(cy), r: round(radius) });
    if (index % 2 === 0) {
      elements.push({
        kind: 'path',
        d: `M ${round(cx - radius - 4)} ${round(cy)} Q ${round(cx)} ${round(cy - radius * 0.7)} ${round(cx + radius + 4)} ${round(cy)}`,
      });
    }
  }

  const stars = 18 + complexity * 4;
  for (let index = 0; index < stars; index += 1) {
    const x = 12 + rng.next() * (WIDTH - 24);
    const y = 12 + rng.next() * (HEIGHT - 24);
    elements.push({ kind: 'circle', cx: round(x), cy: round(y), r: 0.6 + rng.next() * 0.8 });
  }

  const rocketX = 30 + rng.next() * 15;
  const rocketY = 198;
  elements.push({
    kind: 'path',
    d: `M ${round(rocketX)} ${rocketY} Q ${round(rocketX + 6)} ${rocketY - 18} ${round(rocketX + 12)} ${rocketY} L ${round(rocketX + 9)} ${rocketY + 3} L ${round(rocketX + 3)} ${rocketY + 3} Z`,
  });
  elements.push({
    kind: 'path',
    d: `M ${round(rocketX + 3)} ${rocketY + 3} L ${round(rocketX)} ${rocketY + 12} M ${round(rocketX + 9)} ${rocketY + 3} L ${round(rocketX + 12)} ${rocketY + 12}`,
  });
  elements.push({ kind: 'circle', cx: round(rocketX + 6), cy: round(rocketY - 5), r: 1.8 });

  return elements;
}

function underwater(rng: Rng, complexity: number): ColoringElement[] {
  const elements: ColoringElement[] = [];
  const floor = 204;

  elements.push({
    kind: 'path',
    d: `M 10 ${floor} Q 45 ${floor - 10} 80 ${floor - 2} Q 120 ${floor + 8} 170 ${floor - 4} L 170 222 L 10 222 Z`,
  });

  const coral = (x: number, y: number, height: number, angle: number, depth: number) => {
    const [tx, ty] = localPoint(x, y, height, angle);
    elements.push({ kind: 'path', d: `M ${x} ${y} Q ${round((x + tx) / 2 + 5)} ${round((y + ty) / 2)} ${tx} ${ty}` });
    if (depth <= 0) return;
    coral(tx, ty, height * 0.58, angle - 0.55, depth - 1);
    coral(tx, ty, height * 0.52, angle + 0.45, depth - 1);
  };
  coral(25, floor - 2, 24 + complexity * 2, -1.35, 2 + Math.floor(complexity / 2));
  coral(155, floor - 4, 20 + complexity * 2, -1.8, 2 + Math.floor(complexity / 2));

  for (let index = 0; index < 4 + complexity; index += 1) {
    const x = 18 + rng.next() * 145;
    const height = 16 + rng.next() * 24;
    elements.push({
      kind: 'path',
      d: `M ${round(x)} ${floor} Q ${round(x - 5)} ${round(floor - height * 0.5)} ${round(x + 3)} ${round(floor - height)} Q ${round(x + 9)} ${round(floor - height * 0.4)} ${round(x + 6)} ${floor}`,
    });
  }

  const fishCount = 3 + complexity;
  for (let index = 0; index < fishCount; index += 1) {
    const x = 28 + rng.next() * (WIDTH - 56);
    const y = 52 + rng.next() * 110;
    const scale = 0.8 + rng.next() * 0.8;
    elements.push({ kind: 'path', d: fishPath(x, y, scale) });
    elements.push({ kind: 'circle', cx: round(x + 4 * scale), cy: round(y - 1), r: 0.7 });
  }

  for (let index = 0; index < 12 + complexity * 3; index += 1) {
    elements.push({
      kind: 'circle',
      cx: round(14 + rng.next() * (WIDTH - 28)),
      cy: round(28 + rng.next() * (floor - 48)),
      r: round(0.8 + rng.next() * 1.8),
    });
  }

  for (let index = 0; index < 5 + complexity; index += 1) {
    const x = 16 + rng.next() * 148;
    elements.push({
      kind: 'path',
      d: `M ${round(x)} ${round(floor + 3)} Q ${round(x - 4)} ${round(floor + 10)} ${round(x + 2)} ${round(floor + 16)}`,
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
                : params.theme === 'landscape'
                  ? landscape(rng, complexity)
                  : params.theme === 'botanical'
                    ? botanical(rng, complexity)
                    : params.theme === 'space'
                      ? space(rng, complexity)
                      : params.theme === 'underwater'
                        ? underwater(rng, complexity)
                        : geometric(rng, complexity);

  return {
    width: WIDTH,
    height: HEIGHT,
    strokeWidth: LINE_WIDTH_MM[params.lineWeight],
    elements,
  };
}

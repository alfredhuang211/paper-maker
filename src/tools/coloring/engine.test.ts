import { describe, expect, it } from 'vitest';
import { generateColoring, LINE_WIDTH_MM, type ColoringTheme } from './engine';

const themes: ColoringTheme[] = ['symmetry', 'mandala', 'geometric'];

describe('coloring engine', () => {
  it.each(themes)('generates elements for the %s theme', (theme) => {
    const model = generateColoring({ theme, complexity: 3, lineWeight: 'medium', seed: 'seed' });
    expect(model.elements.length).toBeGreaterThan(10);
    expect(model.width).toBe(180);
    expect(model.height).toBe(232);
  });

  it('is deterministic for the same seed and settings', () => {
    const first = generateColoring({
      theme: 'mandala',
      complexity: 4,
      lineWeight: 'thick',
      seed: 'same',
    });
    const second = generateColoring({
      theme: 'mandala',
      complexity: 4,
      lineWeight: 'thick',
      seed: 'same',
    });
    expect(first.elements).toEqual(second.elements);
  });

  it('produces a different drawing for a different seed', () => {
    const first = generateColoring({
      theme: 'geometric',
      complexity: 3,
      lineWeight: 'medium',
      seed: 'a',
    });
    const second = generateColoring({
      theme: 'geometric',
      complexity: 3,
      lineWeight: 'medium',
      seed: 'b',
    });
    expect(first.elements).not.toEqual(second.elements);
  });

  it('increases detail with complexity', () => {
    const simple = generateColoring({
      theme: 'mandala',
      complexity: 1,
      lineWeight: 'medium',
      seed: 'same',
    });
    const complex = generateColoring({
      theme: 'mandala',
      complexity: 5,
      lineWeight: 'medium',
      seed: 'same',
    });
    expect(complex.elements.length).toBeGreaterThan(simple.elements.length);
  });

  it('maps line weight to millimetres', () => {
    const model = generateColoring({
      theme: 'symmetry',
      complexity: 2,
      lineWeight: 'thick',
      seed: 'seed',
    });
    expect(model.strokeWidth).toBe(LINE_WIDTH_MM.thick);
  });

  it('keeps circles inside the drawing area', () => {
    const model = generateColoring({
      theme: 'mandala',
      complexity: 5,
      lineWeight: 'medium',
      seed: 'seed',
    });
    for (const element of model.elements) {
      if (element.kind !== 'circle') continue;
      expect(element.cx - element.r).toBeGreaterThanOrEqual(0);
      expect(element.cx + element.r).toBeLessThanOrEqual(model.width);
      expect(element.cy - element.r).toBeGreaterThanOrEqual(0);
      expect(element.cy + element.r).toBeLessThanOrEqual(model.height);
    }
  });
});

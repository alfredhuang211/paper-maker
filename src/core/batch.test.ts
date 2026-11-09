import { describe, expect, it } from 'vitest';
import { sheetSeed } from './batch';

describe('batch seeds', () => {
  it('keeps the first sheet on the base seed', () => {
    expect(sheetSeed('abc', 0, 'different')).toBe('abc');
    expect(sheetSeed('abc', 0, 'same')).toBe('abc');
  });

  it('derives distinct stable seeds for different sheets', () => {
    expect(sheetSeed('abc', 1, 'different')).toBe('abc-2');
    expect(sheetSeed('abc', 2, 'different')).toBe('abc-3');
  });

  it('reuses the base seed when every sheet is the same', () => {
    expect(sheetSeed('abc', 4, 'same')).toBe('abc');
  });
});

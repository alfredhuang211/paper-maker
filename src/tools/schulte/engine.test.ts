import { describe, expect, it } from 'vitest';
import { generateSchulte, SCHULTE_SIZES } from './engine';

describe('schulte engine', () => {
  it.each(SCHULTE_SIZES)('creates a complete %i×%i grid', (size) => {
    const model = generateSchulte({ size, seed: 'seed' });
    expect(model.size).toBe(size);
    expect(model.numbers).toHaveLength(size * size);
    expect([...model.numbers].sort((a, b) => a - b)).toEqual(
      Array.from({ length: size * size }, (_, index) => index + 1),
    );
  });

  it('is deterministic for the same seed', () => {
    const first = generateSchulte({ size: 5, seed: 'same' });
    const second = generateSchulte({ size: 5, seed: 'same' });
    expect(first.numbers).toEqual(second.numbers);
  });

  it('produces a different arrangement for a different seed', () => {
    const first = generateSchulte({ size: 5, seed: 'a' });
    const second = generateSchulte({ size: 5, seed: 'b' });
    expect(first.numbers).not.toEqual(second.numbers);
  });
});

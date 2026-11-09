export type BatchMode = 'different' | 'same';

/**
 * Sheet 0 always uses the base seed, so a single-sheet export stays identical
 * to the previous behaviour. Additional sheets derive a stable child seed.
 */
export function sheetSeed(baseSeed: string, index: number, mode: BatchMode): string {
  if (mode === 'same' || index === 0) return baseSeed;
  return `${baseSeed}-${index + 1}`;
}

import { createRng } from '../../core/random';

export type SchulteSize = 3 | 4 | 5 | 6 | 7;

export interface SchulteParams {
  size: SchulteSize;
  seed: string;
}

export interface SchulteModel {
  size: SchulteSize;
  numbers: number[];
}

export const SCHULTE_SIZES: SchulteSize[] = [3, 4, 5, 6, 7];

export function generateSchulte(params: SchulteParams): SchulteModel {
  const count = params.size * params.size;
  const numbers = Array.from({ length: count }, (_, index) => index + 1);
  const rng = createRng(`${params.seed}|schulte|${params.size}`);
  return { size: params.size, numbers: rng.shuffle(numbers) };
}

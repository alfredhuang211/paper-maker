import { createRng, type Rng } from '../../core/random';

export type MathOp = 'add' | 'sub' | 'mul' | 'div';
export type FillMode = 'answer' | 'operand';

export interface MathParams {
  ops: MathOp[];
  range: number;
  /** Addition questions must carry when true; must not carry when false. */
  carry: boolean;
  /** Subtraction questions must borrow when true; must not borrow when false. */
  borrow: boolean;
  /** Which part of the equation the learner fills in. */
  fillModes: FillMode[];
  count: number;
  columns: number;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  showAnswers: boolean;
  title: string;
  showName: boolean;
  showDate: boolean;
  seed: string;
}

export interface MathQuestion {
  a: number;
  b: number;
  op: MathOp;
  answer: number;
  fill: FillMode;
  hidden?: 'a' | 'b';
}

type GeneratedQuestion = Omit<MathQuestion, 'fill' | 'hidden'>;

export interface MathModel {
  questions: MathQuestion[];
  uniqueCount: number;
  warning: boolean;
}

export const OP_SYMBOL: Record<MathOp, string> = {
  add: '+',
  sub: '−',
  mul: '×',
  div: '÷',
};

export function questionText(question: MathQuestion): string {
  return `${question.a} ${OP_SYMBOL[question.op]} ${question.b}`;
}

export function questionKey(question: Pick<MathQuestion, 'a' | 'b' | 'op'>): string {
  const [left, right] =
    question.op === 'add' || question.op === 'mul'
      ? [question.a, question.b].sort((x, y) => x - y)
      : [question.a, question.b];
  return `${question.op}:${left}:${right}`;
}

function hasCarry(a: number, b: number): boolean {
  return (a % 10) + (b % 10) >= 10;
}

function hasBorrow(a: number, b: number): boolean {
  return a % 10 < b % 10;
}

function makeQuestion(
  op: MathOp,
  range: number,
  carry: boolean,
  borrow: boolean,
  rng: Rng,
): GeneratedQuestion | null {
  const max = Math.max(2, Math.floor(range));

  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (op === 'add') {
      const a = rng.int(0, max);
      const b = rng.int(0, max);
      const sum = a + b;
      if (sum > range) continue;
      if (carry !== hasCarry(a, b)) continue;
      if (a === 0 || b === 0) continue;
      return { a, b, op, answer: sum };
    }

    if (op === 'sub') {
      let a = rng.int(0, max);
      let b = rng.int(0, max);
      if (a < b) [a, b] = [b, a];
      if (a === b || b === 0) continue;
      if (borrow !== hasBorrow(a, b)) continue;
      return { a, b, op, answer: a - b };
    }

    if (op === 'mul') {
      const factorMax = Math.min(9, Math.max(2, range));
      const a = rng.int(1, factorMax);
      const b = rng.int(1, factorMax);
      const product = a * b;
      if (product > range) continue;
      if (a === 1 || b === 1) continue;
      return { a, b, op, answer: product };
    }

    // Division: generate from a divisor and quotient so the result is exact.
    const divisorMax = Math.min(9, Math.max(2, Math.floor(Math.sqrt(range)) + 1));
    const divisor = rng.int(2, divisorMax);
    const quotientMax = Math.max(2, Math.floor(range / divisor));
    const quotient = rng.int(2, Math.min(9, quotientMax));
    const dividend = divisor * quotient;
    if (dividend > range) continue;
    return { a: dividend, b: divisor, op, answer: quotient };
  }

  return null;
}

export function generateMathWorksheet(params: MathParams): MathModel {
  const ops = params.ops.length > 0 ? params.ops : ['add' as MathOp];
  const rng = createRng(
    `${params.seed}|math|${ops.join(',')}|${params.range}|${params.carry}|${params.borrow}`,
  );
  const pool: GeneratedQuestion[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (pool.length < 100 && attempts < 20000) {
    attempts += 1;
    const op = rng.pick(ops);
    const question = makeQuestion(op, params.range, params.carry, params.borrow, rng);
    if (!question) continue;
    const key = questionKey(question);
    if (seen.has(key)) continue;
    seen.add(key);
    pool.push(question);
  }

  const count = Math.max(1, Math.min(100, Math.floor(params.count)));
  const questions = pool.slice(0, count);

  if (questions.length < count) {
    if (pool.length === 0) {
      // Degenerate settings (e.g. impossible carry constraint): fall back to auto.
      const fallback = generateMathWorksheet({ ...params, carry: false, borrow: false });
      return { ...fallback, warning: true };
    }
    let index = 0;
    while (questions.length < count) {
      questions.push({ ...pool[index % pool.length] });
      index += 1;
    }
  }

  const fillModes = params.fillModes.length > 0 ? params.fillModes : (['answer'] as FillMode[]);
  const withFill = questions.map((question, index) => {
    const fillRng = createRng(`${params.seed}|fill|${index}|${fillModes.join(',')}`);
    const fill = fillModes.length === 1 ? fillModes[0] : fillRng.pick(fillModes);
    if (fill === 'operand') {
      return { ...question, fill, hidden: fillRng.next() < 0.5 ? 'a' : 'b' } as MathQuestion;
    }
    return { ...question, fill } as MathQuestion;
  });

  return {
    questions: withFill,
    uniqueCount: pool.length,
    warning: questions.length > pool.length || pool.length < count,
  };
}

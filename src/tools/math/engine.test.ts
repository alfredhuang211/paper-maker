import { describe, expect, it } from 'vitest';
import {
  generateMathWorksheet,
  questionKey,
  type MathOp,
  type MathParams,
} from './engine';

const baseParams: MathParams = {
  ops: ['add', 'sub'],
  range: 100,
  carry: true,
  borrow: true,
  count: 20,
  columns: 4,
  fontSize: 'md',
  showAnswers: true,
  title: '',
  showName: true,
  showDate: true,
  seed: 'test-seed',
};

function generate(overrides: Partial<MathParams> = {}) {
  return generateMathWorksheet({ ...baseParams, ...overrides });
}

function hasCarry(a: number, b: number) {
  return (a % 10) + (b % 10) >= 10;
}

function hasBorrow(a: number, b: number) {
  return a % 10 < b % 10;
}

describe('math worksheet engine', () => {
  it('generates the requested number of questions with correct answers', () => {
    const model = generate({ count: 40 });
    expect(model.questions).toHaveLength(40);
    for (const question of model.questions) {
      if (question.op === 'add') expect(question.answer).toBe(question.a + question.b);
      if (question.op === 'sub') expect(question.answer).toBe(question.a - question.b);
      if (question.op === 'mul') expect(question.answer).toBe(question.a * question.b);
      if (question.op === 'div') {
        expect(question.a % question.b).toBe(0);
        expect(question.answer).toBe(question.a / question.b);
      }
    }
  });

  it('keeps operands and answers inside the selected range', () => {
    const model = generate({ count: 50, range: 20 });
    for (const question of model.questions) {
      expect(question.a).toBeGreaterThanOrEqual(0);
      expect(question.b).toBeGreaterThanOrEqual(0);
      expect(question.a).toBeLessThanOrEqual(20);
      expect(question.b).toBeLessThanOrEqual(20);
      expect(question.answer).toBeGreaterThanOrEqual(0);
      expect(question.answer).toBeLessThanOrEqual(20);
    }
  });

  it('is deterministic for the same seed and settings', () => {
    const first = generate({ count: 30 });
    const second = generate({ count: 30 });
    expect(first.questions).toEqual(second.questions);
  });

  it('keeps the first questions stable when the count changes', () => {
    const twenty = generate({ count: 20 });
    const thirty = generate({ count: 30 });
    expect(thirty.questions.slice(0, 20)).toEqual(twenty.questions);
  });

  it('produces different questions for different seeds', () => {
    const first = generate({ count: 20, seed: 'seed-a' });
    const second = generate({ count: 20, seed: 'seed-b' });
    expect(first.questions).not.toEqual(second.questions);
  });

  it('only generates carrying additions when required', () => {
    const model = generate({ ops: ['add'], range: 100, carry: true, borrow: false, count: 30 });
    for (const question of model.questions) {
      expect(hasCarry(question.a, question.b)).toBe(true);
      expect(question.a + question.b).toBeLessThanOrEqual(100);
    }
  });

  it('only generates borrowing subtractions when required', () => {
    const model = generate({ ops: ['sub'], range: 100, carry: false, borrow: true, count: 30 });
    for (const question of model.questions) {
      expect(hasBorrow(question.a, question.b)).toBe(true);
      expect(question.a).toBeGreaterThanOrEqual(question.b);
    }
  });

  it('avoids carrying and borrowing when requested', () => {
    const model = generate({ ops: ['add', 'sub'], range: 100, carry: false, borrow: false, count: 30 });
    for (const question of model.questions) {
      if (question.op === 'add') expect(hasCarry(question.a, question.b)).toBe(false);
      if (question.op === 'sub') expect(hasBorrow(question.a, question.b)).toBe(false);
    }
  });

  it('does not repeat questions within a page when enough unique questions exist', () => {
    const model = generate({ count: 30, range: 100 });
    const keys = model.questions.map(questionKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('supports every operation', () => {
    const ops: MathOp[] = ['add', 'sub', 'mul', 'div'];
    const model = generate({ ops, count: 40, range: 100 });
    const seen = new Set(model.questions.map((question) => question.op));
    expect(seen.size).toBeGreaterThan(1);
  });

  it('supports both carrying and borrowing when both are checked', () => {
    const model = generate({ ops: ['add', 'sub'], range: 100, carry: true, borrow: true, count: 40 });
    expect(model.questions.some((q) => q.op === 'add' && hasCarry(q.a, q.b))).toBe(true);
    expect(model.questions.some((q) => q.op === 'sub' && hasBorrow(q.a, q.b))).toBe(true);
  });

  it('falls back gracefully when a carry constraint is impossible', () => {
    const model = generate({ ops: ['add'], range: 5, carry: true, borrow: false, count: 10 });
    expect(model.questions).toHaveLength(10);
  });
});

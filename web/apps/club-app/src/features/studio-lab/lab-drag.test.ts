import { describe, expect, it } from 'vitest';
import { labDragStepOf, labPolicyOf } from './lab-drag';

const move = (held: boolean) => ({
  point: { x: 0, y: 0 },
  value: { x: 0, y: 0 },
  delta: { x: 8, y: -4 },
  precision: 'half' as const,
  held,
});

describe('labPolicyOf', () => {
  it.each([
    ['distance', 'x'],
    ['hold', 'none'],
  ] as const)('%s precision uses axis %s', (precision, axis) => {
    expect(labPolicyOf(precision, 'x').precision).toBe(axis);
  });
});

describe('labDragStepOf', () => {
  it.each([
    ['distance', false, { delta: { x: 8, y: -4 }, tier: 'half' }],
    ['hold', false, { delta: { x: 8, y: -4 }, tier: 'full' }],
    ['hold', true, { delta: { x: 2, y: -1 }, tier: 'quarter' }],
  ] as const)('%s precision, held %s', (precision, held, step) => {
    expect(labDragStepOf(precision, move(held))).toEqual(step);
  });
});

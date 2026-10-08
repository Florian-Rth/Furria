import { describe, expect, it } from 'vitest';
import { arrivalCascadeOf } from './arrival-cascade';

const SELECTOR = '& > *';

const delayOf = (cascade: ReturnType<typeof arrivalCascadeOf>, nth: string): number =>
  Number.parseFloat(String(cascade[`${SELECTOR}:nth-of-type(${nth})`]?.animationDelay));

describe('arrivalCascadeOf', () => {
  it('delays each block by one more step, starting at zero', () => {
    const cascade = arrivalCascadeOf(SELECTOR, 4);
    const delays = ['1', '2', '3', '4'].map((nth) => delayOf(cascade, nth));

    expect(delays[0]).toBe(0);
    expect(new Set(delays).size).toBe(delays.length);
    expect(delays).toEqual([...delays].sort((first, second) => first - second));
  });

  it('holds every block past the cascade at the last delay', () => {
    const cascade = arrivalCascadeOf(SELECTOR, 4);

    expect(delayOf(cascade, 'n + 5')).toBe(delayOf(cascade, '4'));
  });
});

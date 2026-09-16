import { describe, expect, it } from 'vitest';
import { arrivalCascadeOf } from './arrival-cascade';

const SELECTOR = '& > *';

describe('arrivalCascadeOf', () => {
  it('animates every block it is pointed at', () => {
    expect(arrivalCascadeOf(SELECTOR, 3)[SELECTOR]).toHaveProperty('animation');
  });

  it('lets the first block arrive without waiting', () => {
    const cascade = arrivalCascadeOf(SELECTOR, 3);

    expect(cascade[`${SELECTOR}:nth-of-type(1)`]).toEqual({ animationDelay: '0.000s' });
  });

  it('delays each following block by one more step than the one before it', () => {
    const cascade = arrivalCascadeOf(SELECTOR, 4);
    const delays = [1, 2, 3, 4].map((block) =>
      Number.parseFloat(String(cascade[`${SELECTOR}:nth-of-type(${block})`]?.animationDelay)),
    );

    expect(delays).toEqual([...delays].sort((first, second) => first - second));
    expect(new Set(delays).size).toBe(delays.length);
  });

  it('holds every block past the cascade at the last delay, so a long page still arrives', () => {
    const blocks = 4;
    const cascade = arrivalCascadeOf(SELECTOR, blocks);
    const last = cascade[`${SELECTOR}:nth-of-type(${blocks})`];

    expect(cascade[`${SELECTOR}:nth-of-type(n + ${blocks + 1})`]).toEqual(last);
  });

  it('writes one rule per block plus the animation and the tail', () => {
    expect(Object.keys(arrivalCascadeOf(SELECTOR, 5))).toHaveLength(7);
  });
});

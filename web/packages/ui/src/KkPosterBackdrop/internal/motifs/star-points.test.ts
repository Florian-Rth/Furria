import { describe, expect, it } from 'vitest';
import { starPoints } from './star-points';

describe('starPoints', () => {
  it('alternates outer and inner radius starting straight up', () => {
    expect(starPoints(10, 10, 10, 5, 2)).toBe('10,0 15,10 10,20 5,10');
  });
});

import { describe, expect, it } from 'vitest';
import { wavePathOf } from './wave-path';

describe('wavePathOf', () => {
  it('draws one bar per value around the middle, quiet values as a thin line', () => {
    expect(wavePathOf([1, 0], 20, 100)).toBe('M0.0 0.0h6.2v100.0h-6.2zM10.0 48.0h6.2v4.0h-6.2z');
  });

  it('draws nothing before peaks or width are known', () => {
    expect(wavePathOf([], 20, 100)).toBe('');
    expect(wavePathOf([1], 0, 100)).toBe('');
  });
});

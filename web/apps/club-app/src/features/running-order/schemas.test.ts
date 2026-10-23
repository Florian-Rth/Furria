import { describe, expect, it } from 'vitest';
import { RunningOrderSearchSchema } from './schemas';

describe('RunningOrderSearchSchema', () => {
  it.each([
    ['pick', 'pick'],
    ['order', 'order'],
    ['check', 'check'],
    ['wishes', undefined],
    [undefined, undefined],
  ])('reads the mode %s as %s', (mode, parsed) => {
    expect(RunningOrderSearchSchema.parse({ mode }).mode).toBe(parsed);
  });
});

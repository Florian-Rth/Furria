import { describe, expect, it } from 'vitest';
import { formatEuros } from './money';

describe('formatEuros', () => {
  it('drops the cents for whole euro amounts', () => {
    expect(formatEuros(1400)).toBe('14 €');
  });

  it('keeps the German decimal comma for broken amounts', () => {
    expect(formatEuros(1050)).toBe('10,50 €');
  });
});

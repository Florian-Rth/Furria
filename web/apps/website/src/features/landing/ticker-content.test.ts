import { describe, expect, it } from 'vitest';
import { buildTickerPhrases } from './ticker-content';

describe('buildTickerPhrases', () => {
  it('announces the club, the town and the derived session label', () => {
    expect(buildTickerPhrases('2026/27')).toEqual([
      'GROSS FURRIA',
      'GROSSFURRA',
      'SESSION 2026/27',
    ]);
  });
});

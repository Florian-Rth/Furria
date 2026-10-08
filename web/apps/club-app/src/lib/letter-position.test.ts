import { describe, expect, it } from 'vitest';
import { hasPassedTheToolbar } from './letter-position';

const DIVIDER_HEIGHT = 36;

describe('hasPassedTheToolbar', () => {
  it.each([
    { label: 'sits a screen below the bar', dividerTop: 600, barClearance: 248, expected: false },
    {
      label: 'is one pixel below its early line',
      dividerTop: 285,
      barClearance: 248,
      expected: false,
    },
    { label: 'reaches its early line', dividerTop: 284, barClearance: 248, expected: true },
    { label: 'has scrolled off the top', dividerTop: -900, barClearance: 248, expected: true },
    { label: 'sits under a short toolbar', dividerTop: 200, barClearance: 110, expected: false },
  ])('answers $expected for a divider that $label', ({ dividerTop, barClearance, expected }) => {
    expect(hasPassedTheToolbar({ dividerTop, dividerHeight: DIVIDER_HEIGHT, barClearance })).toBe(
      expected,
    );
  });
});

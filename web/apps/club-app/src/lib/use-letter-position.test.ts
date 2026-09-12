import { describe, expect, it } from 'vitest';
import { hasPassedTheToolbar } from './use-letter-position';

const BAR_CLEARANCE = 248;
const DIVIDER_HEIGHT = 36;

describe('hasPassedTheToolbar', () => {
  it.each([
    { label: 'sits a screen below the bar', dividerTop: 600, expected: false },
    { label: 'is one pixel below its early line', dividerTop: 285, expected: false },
    { label: 'reaches its early line, one divider above the bar', dividerTop: 284, expected: true },
    { label: 'sits hidden under the opaque bar', dividerTop: 120, expected: true },
    { label: 'touches the top of the viewport', dividerTop: 0, expected: true },
    { label: 'has scrolled off the top', dividerTop: -900, expected: true },
  ])('answers $expected for a divider that $label', ({ dividerTop, expected }) => {
    expect(
      hasPassedTheToolbar({
        dividerTop,
        dividerHeight: DIVIDER_HEIGHT,
        barClearance: BAR_CLEARANCE,
      }),
    ).toBe(expected);
  });

  it('counts a divider under the bar as passed, which a zero clearance would not', () => {
    const underTheBar = { dividerTop: 120, dividerHeight: DIVIDER_HEIGHT };

    expect(hasPassedTheToolbar({ ...underTheBar, barClearance: BAR_CLEARANCE })).toBe(true);
    expect(hasPassedTheToolbar({ ...underTheBar, barClearance: 0 })).toBe(false);
  });

  it('moves the line with the clearance, so a taller toolbar marks the letter earlier', () => {
    const divider = { dividerTop: 200, dividerHeight: DIVIDER_HEIGHT };

    expect(hasPassedTheToolbar({ ...divider, barClearance: 110 })).toBe(false);
    expect(hasPassedTheToolbar({ ...divider, barClearance: 248 })).toBe(true);
  });
});

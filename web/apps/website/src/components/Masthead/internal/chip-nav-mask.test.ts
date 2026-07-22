import { describe, expect, it } from 'vitest';
import { chipNavFadeWidths, chipNavTransition } from './chip-nav-mask';

describe('chipNavFadeWidths', () => {
  it('collapses both fades when nothing overflows', () => {
    expect(chipNavFadeWidths({ start: false, end: false }, '40px')).toEqual({
      start: '0px',
      end: '0px',
    });
  });

  it('opens the start fade when scrolled away from the beginning', () => {
    expect(chipNavFadeWidths({ start: true, end: false }, '40px')).toEqual({
      start: '40px',
      end: '0px',
    });
  });

  it('opens the end fade when more content follows', () => {
    expect(chipNavFadeWidths({ start: false, end: true }, '40px')).toEqual({
      start: '0px',
      end: '40px',
    });
  });

  it('opens both fades when overflowing on both sides', () => {
    expect(chipNavFadeWidths({ start: true, end: true }, '40px')).toEqual({
      start: '40px',
      end: '40px',
    });
  });
});

describe('chipNavTransition', () => {
  const durations = { enter: 200, leave: 375 };

  it('uses the leave duration for edges that are collapsing', () => {
    expect(chipNavTransition({ start: false, end: false }, 'ease', durations)).toBe(
      '--chip-fade-start 375ms ease, --chip-fade-end 375ms ease',
    );
  });

  it('uses the enter duration for edges that are opening', () => {
    expect(chipNavTransition({ start: true, end: true }, 'ease', durations)).toBe(
      '--chip-fade-start 200ms ease, --chip-fade-end 200ms ease',
    );
  });

  it('picks the duration per edge from its target state', () => {
    expect(chipNavTransition({ start: true, end: false }, 'ease', durations)).toBe(
      '--chip-fade-start 200ms ease, --chip-fade-end 375ms ease',
    );
  });
});

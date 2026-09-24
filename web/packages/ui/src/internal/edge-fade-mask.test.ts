import { describe, expect, it } from 'vitest';
import { edgeFadeTransition, edgeFadeWidths } from './edge-fade-mask';

describe('edgeFadeWidths', () => {
  it('collapses both fades when nothing overflows', () => {
    expect(edgeFadeWidths({ start: false, end: false }, '40px')).toEqual({
      start: '0px',
      end: '0px',
    });
  });

  it('opens the start fade when scrolled away from the beginning', () => {
    expect(edgeFadeWidths({ start: true, end: false }, '40px')).toEqual({
      start: '40px',
      end: '0px',
    });
  });

  it('opens the end fade when more content follows', () => {
    expect(edgeFadeWidths({ start: false, end: true }, '40px')).toEqual({
      start: '0px',
      end: '40px',
    });
  });

  it('opens both fades when overflowing on both sides', () => {
    expect(edgeFadeWidths({ start: true, end: true }, '40px')).toEqual({
      start: '40px',
      end: '40px',
    });
  });
});

describe('edgeFadeTransition', () => {
  const durations = { enter: 200, leave: 375 };

  it('uses the leave duration for edges that are collapsing', () => {
    expect(edgeFadeTransition({ start: false, end: false }, 'ease', durations)).toBe(
      '--kk-edge-fade-start 375ms ease, --kk-edge-fade-end 375ms ease',
    );
  });

  it('uses the enter duration for edges that are opening', () => {
    expect(edgeFadeTransition({ start: true, end: true }, 'ease', durations)).toBe(
      '--kk-edge-fade-start 200ms ease, --kk-edge-fade-end 200ms ease',
    );
  });

  it('picks the duration per edge from its target state', () => {
    expect(edgeFadeTransition({ start: true, end: false }, 'ease', durations)).toBe(
      '--kk-edge-fade-start 200ms ease, --kk-edge-fade-end 375ms ease',
    );
  });
});

import { describe, expect, it } from 'vitest';
import type { StudioDot } from './studio-dots';
import { selectionAnchorOf } from './studio-dots';

const WHOLE = { left: 0, top: 0, width: 1, height: 1 };

const dot = (spotId: number, x: number, y: number, selected: boolean): StudioDot => ({
  spotId,
  number: spotId,
  kind: 'cast',
  x,
  y,
  turn: null,
  label: '',
  selected,
  dimmed: false,
});

describe('selectionAnchorOf', () => {
  it('floats above the middle of the chosen dots', () => {
    expect(
      selectionAnchorOf(
        [dot(1, 0.2, 0.5, true), dot(2, 0.6, 0.4, true), dot(3, 0.9, 0.1, false)],
        WHOLE,
      ),
    ).toEqual({ x: 0.4, y: 0.4, side: 'above' });
  });

  it('drops below the chosen dots when they stand at the top edge', () => {
    expect(selectionAnchorOf([dot(1, 0.5, 0.1, true), dot(2, 0.5, 0.3, true)], WHOLE)).toEqual({
      x: 0.5,
      y: 0.3,
      side: 'below',
    });
  });

  it('drops below when the chosen dots stand at the top of the zoomed view', () => {
    expect(
      selectionAnchorOf([dot(1, 0.5, 0.55, true)], {
        left: 0.25,
        top: 0.5,
        width: 0.5,
        height: 0.5,
      }),
    ).toEqual({ x: 0.5, y: 0.55, side: 'below' });
  });

  it('has no anchor without a selection', () => {
    expect(selectionAnchorOf([dot(1, 0.5, 0.5, false)], WHOLE)).toBeNull();
  });
});

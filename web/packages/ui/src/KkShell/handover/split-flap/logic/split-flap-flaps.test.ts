import { describe, expect, it } from 'vitest';
import {
  boardProgressAt,
  cellOffsetAt,
  cellWindowOf,
  flapPoseAt,
  headerFoldAt,
  headerTravelAt,
  ramp,
  splitFlapCellsOf,
} from './split-flap-flaps';

describe('ramp', () => {
  it.each([
    [-5, 0, 10, 0],
    [0, 0, 10, 0],
    [5, 0, 10, 0.5],
    [10, 0, 10, 1],
    [20, 0, 10, 1],
  ])('ramps %d between %d and %d to %d', (value, from, to, expected) => {
    expect(ramp(value, from, to)).toBe(expected);
  });
});

describe('splitFlapCellsOf', () => {
  it('pairs glyphs slot by slot and blanks the shorter side at the longer side’s centre', () => {
    const cells = splitFlapCellsOf(
      [
        { char: 'L', left: 0, width: 10 },
        { char: 'a', left: 10, width: 8 },
      ],
      [
        { char: 'M', left: 0, width: 14 },
        { char: 'i', left: 14, width: 6 },
        { char: 't', left: 20, width: 7 },
      ],
    );

    expect(cells).toEqual([
      { slot: '0', from: 'L', to: 'M', fromCenter: 5, toCenter: 7, width: 14 },
      { slot: '1', from: 'a', to: 'i', fromCenter: 14, toCenter: 17, width: 8 },
      { slot: '2', from: '', to: 't', fromCenter: 23.5, toCenter: 23.5, width: 7 },
    ]);
  });

  it('keeps an old glyph in place when the new text is shorter', () => {
    const cells = splitFlapCellsOf(
      [
        { char: 'A', left: 0, width: 10 },
        { char: 'B', left: 10, width: 12 },
      ],
      [{ char: 'C', left: 0, width: 9 }],
    );

    expect(cells[1]).toEqual({
      slot: '1',
      from: 'B',
      to: '',
      fromCenter: 16,
      toCenter: 16,
      width: 12,
    });
  });
});

describe('cellWindowOf', () => {
  it.each([
    [0, 1, 0, 0, 1],
    [0, 10, 0, 0, 0.44],
    [9, 10, 0, 0.56, 1],
    [0, 10, 0.28, 0.28, 0.6],
  ])('places cell %d of %d (lead %d) between %d and %d', (index, count, lead, start, end) => {
    const window = cellWindowOf(index, count, lead);

    expect(window.start).toBeCloseTo(start, 2);
    expect(window.end).toBeCloseTo(end, 2);
  });
});

describe('flapPoseAt', () => {
  it('rests with the old top up and nothing revealed', () => {
    expect(flapPoseAt(0)).toEqual({
      fall: -0,
      land: 90,
      reveal: 0,
      cover: 0,
      presence: 0,
      fallen: false,
    });
  });

  it('has the old top edge-on and the new top fully revealed at the hinge moment', () => {
    const pose = flapPoseAt(0.5);

    expect(pose.fall).toBe(-90);
    expect(pose.land).toBe(90);
    expect(pose.reveal).toBe(1);
    expect(pose.fallen).toBe(true);
    expect(pose.presence).toBeCloseTo(1);
  });

  it.each([0.6, 0.8, 0.9])('lands the new bottom before it rebounds at %d', (progress) => {
    expect(flapPoseAt(progress).land).toBeGreaterThan(0);
  });

  it('covers the old bottom completely once the flap has struck', () => {
    expect(flapPoseAt(0.95).cover).toBe(1);
  });

  it('settles flat and covered at the end', () => {
    const pose = flapPoseAt(1);

    expect(pose.land).toBeCloseTo(0);
    expect(pose.cover).toBe(1);
    expect(pose.presence).toBeCloseTo(0);
  });
});

describe('cellOffsetAt', () => {
  const cell = { slot: '0', from: 'L', to: 'M', fromCenter: 5, toCenter: 25, width: 10 };

  it.each([
    [0, 0],
    [0.5, 10],
    [1, 20],
  ])('slides the cell at progress %d to %d', (progress, expected) => {
    expect(cellOffsetAt(cell, progress)).toBe(expected);
  });
});

describe('boardProgressAt', () => {
  it.each([
    [0, false, 0],
    [-30, false, 0],
    [400, false, 1],
    [1, true, 1],
    [0, true, 0],
  ])('reads offset %d (reduced %s) as %d', (offset, reduced, expected) => {
    expect(boardProgressAt(offset, reduced)).toBe(expected);
  });

  it('is mid-flip half way through the travel', () => {
    const progress = boardProgressAt(50, false);

    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1);
  });
});

describe('headerTravelAt', () => {
  it.each([
    [0, false, 0],
    [400, false, 1],
    [2, true, 1],
  ])('reads offset %d (reduced %s) as %d', (offset, reduced, expected) => {
    expect(headerTravelAt(offset, reduced)).toBe(expected);
  });
});

describe('headerFoldAt', () => {
  it.each([
    [0, 0, 0, 1, 1],
    [0.5, 37, 17.82, 0.97, 0.78],
    [1, 74, 35.64, 0.94, 0],
  ])('folds the header at travel %d', (travelled, tilt, hold, scale, opacity) => {
    const fold = headerFoldAt(travelled);

    expect(fold.tilt).toBeCloseTo(tilt, 2);
    expect(fold.hold).toBeCloseTo(hold, 2);
    expect(fold.scale).toBeCloseTo(scale, 2);
    expect(fold.opacity).toBeCloseTo(opacity, 2);
  });
});

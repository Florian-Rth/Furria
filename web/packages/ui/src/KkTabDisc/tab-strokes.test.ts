import { describe, expect, it } from 'vitest';
import {
  TAB_DISC_FIELD_RADIUS,
  TAB_DISC_VIEW,
  TAB_TALLY_WIDTH,
  tabDiscMarksOf,
  tabTallyMarksOf,
} from './tab-strokes';

const CENTER = TAB_DISC_VIEW / 2;
const EPSILON = 0.001;

const reachFromCenter = (x: number, y: number): number => Math.hypot(x - CENTER, y - CENTER);

describe('tabDiscMarksOf', () => {
  it.each([
    [0, 0, 0],
    [1, 0, 0],
    [4, 0, 0],
    [5, 1, 0],
    [12, 2, 0],
    [70, 14, 0],
    [73, 14, 3],
  ])('lays %i crates out with %i crossings and %i hidden', (count, crossings, hidden) => {
    const layout = tabDiscMarksOf(count);

    expect(layout.marks).toHaveLength(count - hidden);
    expect(layout.marks.filter((mark) => mark.crossing)).toHaveLength(crossings);
    expect(layout.hidden).toBe(hidden);
  });

  it('crosses every fifth crate', () => {
    const crossingIndexes = tabDiscMarksOf(17)
      .marks.filter((mark) => mark.crossing)
      .map((mark) => mark.index);

    expect(crossingIndexes).toEqual([4, 9, 14]);
  });

  it.each([1, 3, 5, 9, 20, 21, 40, 41, 55, 70])('keeps %i crates inside the field', (count) => {
    const reach = Math.max(
      ...tabDiscMarksOf(count).marks.flatMap((mark) => [
        reachFromCenter(mark.x1, mark.y1),
        reachFromCenter(mark.x2, mark.y2),
      ]),
    );

    expect(reach).toBeLessThanOrEqual(TAB_DISC_FIELD_RADIUS + EPSILON);
  });

  it('draws few crates larger than many', () => {
    const lengthOf = (count: number): number => {
      const first = tabDiscMarksOf(count).marks[0];

      return first === undefined ? 0 : first.y2 - first.y1;
    };

    expect(lengthOf(2)).toBeGreaterThan(lengthOf(60));
  });
});

describe('tabTallyMarksOf', () => {
  it.each([
    [0, 0, 0],
    [7, 7, 0],
    [20, 20, 0],
    [26, 20, 6],
  ])('shows %i crates as %i marks with %i hidden', (count, shown, hidden) => {
    const layout = tabTallyMarksOf(count);

    expect(layout.marks).toHaveLength(shown);
    expect(layout.hidden).toBe(hidden);
  });

  it('stays inside its row', () => {
    const right = Math.max(...tabTallyMarksOf(20).marks.map((mark) => Math.max(mark.x1, mark.x2)));

    expect(right).toBeLessThanOrEqual(TAB_TALLY_WIDTH + EPSILON);
  });
});

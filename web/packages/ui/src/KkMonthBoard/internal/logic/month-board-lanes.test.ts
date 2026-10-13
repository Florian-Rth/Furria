import { describe, expect, it } from 'vitest';
import { hiddenPerDay, packWeek } from './month-board-lanes';
import type { KkMonthBoardBarData } from './month-board-types';

const WEEK = [
  '2026-10-12',
  '2026-10-13',
  '2026-10-14',
  '2026-10-15',
  '2026-10-16',
  '2026-10-17',
  '2026-10-18',
];

const bar = (id: string, startDay: string, endDay: string): KkMonthBoardBarData => ({
  id,
  title: id,
  time: null,
  startDay,
  endDay,
  tone: null,
  running: false,
});

describe('packWeek', () => {
  it('places a bar on its day columns', () => {
    const [placed] = packWeek(WEEK, [bar('trip', '2026-10-14', '2026-10-16')]);

    expect(placed).toMatchObject({ column: 2, span: 3, lane: 0 });
  });

  it('cuts a bar that runs in from the week before and on into the next', () => {
    const [placed] = packWeek(WEEK, [bar('trip', '2026-10-10', '2026-10-20')]);

    expect(placed).toMatchObject({
      column: 0,
      span: 7,
      startsEarlier: true,
      endsLater: true,
    });
  });

  it('leaves out a bar outside the week', () => {
    expect(packWeek(WEEK, [bar('later', '2026-10-19', '2026-10-19')])).toEqual([]);
  });

  it('stacks bars on the same day into separate lanes', () => {
    const lanes = packWeek(WEEK, [
      bar('a', '2026-10-13', '2026-10-13'),
      bar('b', '2026-10-13', '2026-10-13'),
    ]).map((placed) => placed.lane);

    expect(lanes).toEqual([0, 1]);
  });

  it('reuses a lane once the bar before it has ended', () => {
    const lanes = packWeek(WEEK, [
      bar('first', '2026-10-12', '2026-10-13'),
      bar('second', '2026-10-14', '2026-10-14'),
    ]).map((placed) => placed.lane);

    expect(lanes).toEqual([0, 0]);
  });

  it('gives the longer bar the upper lane when two start on the same day', () => {
    const ids = packWeek(WEEK, [
      bar('evening', '2026-10-13', '2026-10-13'),
      bar('trip', '2026-10-13', '2026-10-15'),
    ]).map((placed) => `${placed.bar.id}:${placed.lane}`);

    expect(ids).toEqual(['trip:0', 'evening:1']);
  });
});

describe('hiddenPerDay', () => {
  it('counts the bars beyond the lane limit on every day they cover', () => {
    const placed = packWeek(WEEK, [
      bar('a', '2026-10-12', '2026-10-12'),
      bar('b', '2026-10-12', '2026-10-13'),
      bar('c', '2026-10-12', '2026-10-13'),
    ]);

    expect(hiddenPerDay(placed, WEEK.length, 1)).toEqual([2, 1, 0, 0, 0, 0, 0]);
  });
});

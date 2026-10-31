import { describe, expect, it } from 'vitest';
import {
  hoursAxisOf,
  hoursGrowDelayOf,
  hoursLabelLevelOf,
  hoursLabelPlanOf,
  hoursShareOf,
  hoursSwipeOf,
  hoursTicksOf,
  placeHourBlocks,
} from './calendar-hours-geometry';
import type { KkCalendarHoursBlockData, KkCalendarHoursSpan } from './calendar-hours-types';

const span = (
  startMinute: number,
  endMinute: number,
  flags: Partial<KkCalendarHoursSpan> = {},
): KkCalendarHoursSpan => ({
  startMinute,
  endMinute,
  continuesBefore: false,
  continuesAfter: false,
  openEnd: false,
  ...flags,
});

const block = (
  id: string,
  startMinute: number,
  endMinute: number,
  flags: Partial<KkCalendarHoursSpan> = {},
): KkCalendarHoursBlockData => ({
  ...span(startMinute, endMinute, flags),
  id,
  title: id,
  time: '',
  label: id,
  kind: 'training',
  tone: null,
  running: false,
  usual: false,
  badge: null,
  selected: false,
});

describe('hoursAxisOf', () => {
  it.each([
    { name: 'no entries', spans: [], expected: { startHour: 17, endHour: 23 } },
    {
      name: 'evening trainings',
      spans: [span(1140, 1260), span(1200, 1320)],
      expected: { startHour: 19, endHour: 24 },
    },
    {
      name: 'morning to night leaves room after the last end',
      spans: [span(485, 605), span(1140, 1320)],
      expected: { startHour: 8, endHour: 23 },
    },
    {
      name: 'night owl past midnight',
      spans: [span(1151, 1500)],
      expected: { startHour: 19, endHour: 26 },
    },
    {
      name: 'half hours round outward',
      spans: [span(990, 1350)],
      expected: { startHour: 16, endHour: 23 },
    },
    {
      name: 'late short entry keeps a five hour span with room after it',
      spans: [span(1380, 1430)],
      expected: { startHour: 20, endHour: 25 },
    },
    {
      name: 'continued edges do not stretch the axis',
      spans: [span(0, 1080, { continuesBefore: true }), span(480, 1440, { continuesAfter: true })],
      expected: { startHour: 8, endHour: 19 },
    },
  ])('$name', ({ spans, expected }) => {
    expect(hoursAxisOf(spans)).toEqual(expected);
  });
});

describe('hoursShareOf', () => {
  it.each([
    { minute: 1140, expected: 0.5 },
    { minute: 960, expected: 0 },
    { minute: 900, expected: 0 },
    { minute: 1320, expected: 1 },
    { minute: 1500, expected: 1 },
    { minute: 1050, expected: 0.25 },
  ])('$minute → $expected on 16–22', ({ minute, expected }) => {
    expect(hoursShareOf(minute, { startHour: 16, endHour: 22 })).toBe(expected);
  });
});

describe('placeHourBlocks', () => {
  const axis = { startHour: 8, endHour: 24 };

  it('stacks overlapping entries into sub-rows and reuses a freed row', () => {
    const placement = placeHourBlocks(
      [block('b', 490, 610), block('a', 485, 605), block('c', 1140, 1260)],
      axis,
    );
    const rows = Object.fromEntries(
      placement.blocks.map((placed) => [placed.block.id, placed.row]),
    );

    expect(placement.rows).toBe(2);
    expect(rows).toEqual({ a: 0, b: 1, c: 0 });
  });

  it('only the first entry in a row may lead its label', () => {
    const placement = placeHourBlocks([block('a', 1140, 1260)], axis);

    expect(placement.blocks[0]?.roomBefore).toBeCloseTo(11 / 16);
  });

  it('touching entries share one row', () => {
    const placement = placeHourBlocks([block('a', 1140, 1260), block('b', 1260, 1320)], axis);

    expect(placement.rows).toBe(1);
  });

  it('measures the room up to the next entry in the row or the axis end', () => {
    const placement = placeHourBlocks([block('a', 480, 540), block('b', 960, 1020)], axis);
    const rooms = Object.fromEntries(
      placement.blocks.map((placed) => [placed.block.id, placed.room]),
    );

    const before = Object.fromEntries(
      placement.blocks.map((placed) => [placed.block.id, placed.roomBefore]),
    );

    expect(rooms.a).toBeCloseTo(0.5);
    expect(rooms.b).toBeCloseTo(0.5);
    expect(before).toEqual({ a: 0, b: 0 });
  });

  it('positions exactly and runs continued spans to the axis edges', () => {
    const placement = placeHourBlocks(
      [
        block('a', 0, 600, { continuesBefore: true }),
        block('b', 1200, 1440, { continuesAfter: true }),
      ],
      axis,
    );
    const edges = Object.fromEntries(
      placement.blocks.map((placed) => [
        placed.block.id,
        [placed.left, placed.left + placed.width],
      ]),
    );

    expect(edges.a?.[0]).toBe(0);
    expect(edges.a?.[1]).toBeCloseTo(2 / 16);
    expect(edges.b?.[0]).toBeCloseTo(12 / 16);
    expect(edges.b?.[1]).toBe(1);
  });

  it('an empty lane still has one row', () => {
    expect(placeHourBlocks([], axis)).toEqual({ rows: 1, blocks: [] });
  });
});

describe('hoursLabelLevelOf', () => {
  const base = { glyphPx: 12, timePx: 30, titlePx: 50, gapPx: 4, padPx: 4 };

  it.each([
    { roomPx: 200, blockPx: 40, expected: 'full' },
    { roomPx: 108, blockPx: 40, expected: 'full' },
    { roomPx: 107, blockPx: 40, expected: 'time' },
    { roomPx: 54, blockPx: 54, expected: 'time' },
    { roomPx: 53, blockPx: 30, expected: 'glyph' },
    { roomPx: 19, blockPx: 19, expected: 'none' },
  ])('room $roomPx, block $blockPx → $expected', ({ roomPx, blockPx, expected }) => {
    expect(hoursLabelLevelOf({ ...base, roomPx, blockPx })).toBe(expected);
  });
});

describe('hoursLabelPlanOf', () => {
  const base = { glyphPx: 12, timePx: 30, titlePx: 50, gapPx: 4, padPx: 4, blockPx: 40 };

  it.each([
    { roomPx: 200, before: 300, expected: { level: 'full', side: 'after' } },
    { roomPx: 60, before: 92, expected: { level: 'full', side: 'before' } },
    { roomPx: 60, before: 91, expected: { level: 'time', side: 'after' } },
    { roomPx: 40, before: 0, expected: { level: 'glyph', side: 'after' } },
  ])('room $roomPx, before $before', ({ roomPx, before, expected }) => {
    expect(hoursLabelPlanOf({ ...base, roomPx }, before)).toEqual(expected);
  });
});

describe('hoursTicksOf', () => {
  it('labels every second hour when one hour is too narrow', () => {
    const ticks = hoursTicksOf({ startHour: 8, endHour: 24 }, 320, 28);

    expect(ticks).toHaveLength(17);
    expect(ticks.filter((tick) => tick.label !== null).map((tick) => tick.label)).toEqual([
      '08',
      '10',
      '12',
      '14',
      '16',
      '18',
      '20',
      '22',
    ]);
  });

  it('labels every hour on a wide track and wraps past midnight', () => {
    const ticks = hoursTicksOf({ startHour: 19, endHour: 26 }, 700, 28);

    expect(ticks.map((tick) => tick.label)).toEqual([
      '19',
      '20',
      '21',
      '22',
      '23',
      '00',
      '01',
      null,
    ]);
    expect(ticks[7]?.share).toBe(1);
  });
});

describe('hoursSwipeOf', () => {
  it.each([
    { offset: -80, velocity: 0, expected: 'later' },
    { offset: 80, velocity: 0, expected: 'earlier' },
    { offset: 10, velocity: 0, expected: 'none' },
    { offset: -10, velocity: -900, expected: 'later' },
    { offset: 5, velocity: 900, expected: 'earlier' },
  ])('offset $offset, velocity $velocity → $expected', ({ offset, velocity, expected }) => {
    expect(hoursSwipeOf(offset, velocity, 56)).toBe(expected);
  });
});

describe('hoursGrowDelayOf', () => {
  it.each([
    { lane: 0, share: 0, expected: 0 },
    { lane: 2, share: 0, expected: 0.14 },
    { lane: 1, share: 1, expected: 0.35 },
    { lane: 0, share: 2, expected: 0.28 },
  ])('lane $lane at $share → $expected s', ({ lane, share, expected }) => {
    expect(hoursGrowDelayOf(lane, share)).toBeCloseTo(expected);
  });
});

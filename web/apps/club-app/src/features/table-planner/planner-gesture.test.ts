import { describe, expect, it } from 'vitest';
import type { SeatingStandard, TableType } from '@/features/hall-plan/schemas';
import { drawnRowOf, isDragStarted, moveDeltaOf } from './planner-gesture';

const standard: SeatingStandard = {
  comfortableChairSpacingCm: 60,
  maximumChairSpacingCm: 45,
  chairDepthCm: 50,
  aisleWidthCm: 120,
  exitClearanceCm: 120,
};

const type: TableType = {
  tableTypeId: 1,
  name: 'Biertisch',
  shape: 'rectangle',
  lengthCm: 220,
  widthCm: 50,
  seatsAtEnds: false,
  archived: false,
};

describe('moveDeltaOf', () => {
  it('snaps an unguided move to the grid', () => {
    const moved = moveDeltaOf(
      { minX: 0, minY: 0, maxX: 100, maxY: 100 },
      [],
      { x: 13, y: 26 },
      1,
      false,
    );

    expect(moved.delta).toEqual({ x: 10, y: 30 });
  });

  it('keeps a free move as it is', () => {
    const moved = moveDeltaOf(
      { minX: 0, minY: 0, maxX: 100, maxY: 100 },
      [],
      { x: 13, y: 26 },
      1,
      true,
    );

    expect(moved.delta).toEqual({ x: 13, y: 26 });
  });

  it('aligns to a neighbour edge within reach', () => {
    const moved = moveDeltaOf(
      { minX: 0, minY: 0, maxX: 100, maxY: 100 },
      [{ minX: 203, minY: 500, maxX: 263, maxY: 600 }],
      { x: 201, y: 0 },
      1,
      false,
    );

    expect([moved.delta.x, moved.guides.length > 0]).toEqual([203, true]);
  });
});

describe('isDragStarted', () => {
  it.each([
    { distance: 2, scale: 1, started: false },
    { distance: 2, scale: 4, started: true },
  ])('$distance cm at $scale px/cm', ({ distance, scale, started }) => {
    expect(isDragStarted({ x: 0, y: 0 }, { x: distance, y: 0 }, scale)).toBe(started);
  });
});

describe('drawnRowOf', () => {
  it('places one table for a short drag', () => {
    const row = drawnRowOf('r1', type, standard, { x: 100, y: 100 }, { x: 150, y: 100 }, false);

    expect([row.count, row.x, row.y]).toEqual([1, 100, 100]);
  });

  it('lays a row along the drag, snapped to 15°', () => {
    const row = drawnRowOf('r1', type, standard, { x: 0, y: 0 }, { x: 880, y: 20 }, false);

    expect([row.count, row.rotation]).toEqual([4, 0]);
  });
});

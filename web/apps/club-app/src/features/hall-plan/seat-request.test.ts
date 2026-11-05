import { describe, expect, it } from 'vitest';
import type { SeatingStandard, TablePlanDocument, TableType } from './schemas';
import type { SeatRequest } from './seat-request';
import { blockRowPitch, seatOfferOf, tablesForSeats, withSeatOffer } from './seat-request';

const standard: SeatingStandard = {
  comfortableChairSpacingCm: 60,
  maximumChairSpacingCm: 45,
  chairDepthCm: 50,
  aisleWidthCm: 120,
  exitClearanceCm: 120,
};

const beerTable: TableType = {
  tableTypeId: 1,
  name: 'Biertisch',
  shape: 'rectangle',
  lengthCm: 220,
  widthCm: 50,
  seatsAtEnds: false,
  archived: false,
};

const empty: TablePlanDocument = { seating: 'comfortable', rows: [], groups: [] };

const request = (overrides: Partial<SeatRequest> = {}): SeatRequest => ({
  seats: 20,
  shape: 'row',
  tablesPerRow: 3,
  type: beerTable,
  seating: 'comfortable',
  ...overrides,
});

describe('tablesForSeats', () => {
  it.each([
    [1, 'comfortable', 1],
    [6, 'comfortable', 1],
    [7, 'comfortable', 2],
    [20, 'comfortable', 3],
    [20, 'maximum', 3],
    [8, 'maximum', 1],
    [10, 'maximum', 2],
  ] as const)('%i chairs %s → %i tables', (seats, seating, expected) => {
    expect(tablesForSeats(seats, beerTable, standard, seating)).toBe(expected);
  });
});

describe('seatOfferOf', () => {
  it('builds one row with the fewest tables that seat everybody', () => {
    const offer = seatOfferOf(empty, request(), standard, { x: 0, y: 0 });

    expect([offer.rows.map((row) => row.count), offer.tables, offer.chairs, offer.enough]).toEqual([
      [3],
      3,
      22,
      true,
    ]);
    expect(offer.groupId).toBeNull();
  });

  it('builds a block of full rows plus a short last row, grouped and spaced by the aisle', () => {
    const offer = seatOfferOf(
      empty,
      request({ seats: 50, shape: 'block', tablesPerRow: 3 }),
      standard,
      { x: 0, y: 0 },
    );

    expect(offer.rows.map((row) => row.count)).toEqual([3, 3, 1]);
    expect(offer.chairs).toBe(50);
    expect(new Set(offer.rows.map((row) => row.groupId))).toEqual(new Set([offer.groupId]));
    expect(offer.rows.map((row) => row.y)).toEqual([
      -blockRowPitch(beerTable, standard),
      0,
      blockRowPitch(beerTable, standard),
    ]);
  });

  it('adds the offer with its group to the plan', () => {
    const offer = seatOfferOf(
      empty,
      request({ seats: 30, shape: 'block', tablesPerRow: 3 }),
      standard,
      { x: 0, y: 0 },
    );
    const next = withSeatOffer(empty, offer);

    expect([next.rows.length, next.groups.map((group) => group.id)]).toEqual([2, ['g1']]);
  });
});

describe('blockRowPitch', () => {
  it('keeps exactly one aisle between the chair zones of neighbouring rows', () => {
    expect(blockRowPitch(beerTable, standard)).toBe(50 + 2 * 50 + 120);
  });
});

import { describe, expect, it } from 'vitest';
import type { SeatingStandard, TableType } from './schemas';
import { tablesForSeats } from './seat-request';

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

describe('tablesForSeats', () => {
  it.each([
    [7, 'comfortable', 2],
    [20, 'maximum', 3],
  ] as const)('%i chairs %s → %i tables', (seats, seating, expected) => {
    expect(tablesForSeats(seats, beerTable, standard, seating)).toBe(expected);
  });
});

import { describe, expect, it } from 'vitest';
import { parseStandardFields, parseTypeFields } from './planner-settings';

const standard = {
  comfortable: '60',
  maximum: '45',
  depth: '50',
  aisle: '120',
  exit: '120',
};

describe('parseStandardFields', () => {
  it('reads valid centimetres', () => {
    expect(parseStandardFields(standard)).toEqual({
      comfortableChairSpacingCm: 60,
      maximumChairSpacingCm: 45,
      chairDepthCm: 50,
      aisleWidthCm: 120,
      exitClearanceCm: 120,
    });
  });

  it.each([
    { name: 'maximum wider than comfortable', fields: { ...standard, maximum: '70' } },
    { name: 'below the range', fields: { ...standard, depth: '5' } },
    { name: 'above the range', fields: { ...standard, aisle: '501' } },
    { name: 'a fraction', fields: { ...standard, exit: '12.5' } },
    { name: 'empty', fields: { ...standard, comfortable: ' ' } },
  ])('refuses $name', ({ fields }) => {
    expect(parseStandardFields(fields)).toBeNull();
  });
});

describe('parseTypeFields', () => {
  it('takes the diameter as both sizes of a round table and drops end chairs', () => {
    expect(
      parseTypeFields({
        name: ' Rund ',
        shape: 'round',
        length: '160',
        width: '40',
        seatsAtEnds: true,
      }),
    ).toEqual({ name: 'Rund', shape: 'round', lengthCm: 160, widthCm: 160, seatsAtEnds: false });
  });

  it('keeps a rectangle as entered', () => {
    expect(
      parseTypeFields({
        name: 'Biertisch',
        shape: 'rectangle',
        length: '220',
        width: '50',
        seatsAtEnds: false,
      }),
    ).toEqual({
      name: 'Biertisch',
      shape: 'rectangle',
      lengthCm: 220,
      widthCm: 50,
      seatsAtEnds: false,
    });
  });

  it.each([
    {
      name: 'no name',
      fields: {
        name: ' ',
        shape: 'rectangle' as const,
        length: '120',
        width: '80',
        seatsAtEnds: true,
      },
    },
    {
      name: 'too short',
      fields: {
        name: 'Mini',
        shape: 'rectangle' as const,
        length: '20',
        width: '80',
        seatsAtEnds: true,
      },
    },
    {
      name: 'not a number',
      fields: {
        name: 'X',
        shape: 'rectangle' as const,
        length: 'abc',
        width: '80',
        seatsAtEnds: true,
      },
    },
  ])('refuses $name', ({ fields }) => {
    expect(parseTypeFields(fields)).toBeNull();
  });
});

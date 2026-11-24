import { describe, expect, it } from 'vitest';
import { BeerPotOpeningFormSchema, beerCratesFormSchema, beerStockFormSchema } from './schemas';

describe('beerStockFormSchema', () => {
  it.each([
    ['1', '-5', { beerDrinkId: 1, change: { kind: 'correction', crates: -5 } }],
    ['1', '-6', null],
    ['2', '+500', { beerDrinkId: 2, change: { kind: 'delivery', crates: 500 } }],
    ['1', '501', null],
  ] as const)('drink %s, %s → %j', (beerDrinkId, crates, expected) => {
    const stocks = [
      { beerDrinkId: 1, crates: 5 },
      { beerDrinkId: 2, crates: 0 },
    ];
    const parsed = beerStockFormSchema(stocks).safeParse({ beerDrinkId, crates });

    expect(parsed.success ? parsed.data : null).toEqual(expected);
  });
});

describe('beerCratesFormSchema', () => {
  it.each([
    [[4, 7], { personId: '7', beerDrinkId: '2', count: '6', paid: false }, null],
    [[4, 7], { personId: '9', beerDrinkId: '2', count: '1', paid: false }, null],
  ])('persons %j: %j → %j', (personIds, form, expected) => {
    const parsed = beerCratesFormSchema(personIds, [{ beerDrinkId: 2, maxCount: 5 }]).safeParse(
      form,
    );

    expect(parsed.success ? parsed.data : null).toEqual(expected);
  });
});

describe('BeerPotOpeningFormSchema', () => {
  it.each([
    [
      {
        person: { personId: 3, firstName: 'A', lastName: 'B' },
        paymentLink: '',
        drinks: [
          { beerDrinkId: null, name: 'Veltins', price: '18' },
          { beerDrinkId: null, name: 'veltins ', price: '17' },
        ],
      },
      null,
    ],
  ])('%j → %j', (form, expected) => {
    const parsed = BeerPotOpeningFormSchema.safeParse(form);

    expect(parsed.success ? parsed.data : null).toEqual(expected);
  });
});

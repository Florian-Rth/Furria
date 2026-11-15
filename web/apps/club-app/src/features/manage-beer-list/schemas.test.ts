import { describe, expect, it } from 'vitest';
import {
  BeerDrinkFormSchema,
  BeerHandoverFormSchema,
  BeerPotOpeningFormSchema,
  BeerPotSettingsFormSchema,
  beerCratesFormSchema,
  beerPaymentFormSchema,
  beerStockFormSchema,
} from './schemas';

describe('beerStockFormSchema', () => {
  it.each([
    ['1', '24', { beerDrinkId: 1, change: { kind: 'delivery', crates: 24 } }],
    ['1', '-2', { beerDrinkId: 1, change: { kind: 'correction', crates: -2 } }],
    ['1', '-5', { beerDrinkId: 1, change: { kind: 'correction', crates: -5 } }],
    ['1', '-6', null],
    ['2', '-1', null],
    ['2', '+500', { beerDrinkId: 2, change: { kind: 'delivery', crates: 500 } }],
    ['1', '501', null],
    ['1', '0', null],
    ['1', 'x', null],
    ['', '3', null],
    ['3', '3', null],
  ] as const)('drink %s, %s → %j', (beerDrinkId, crates, expected) => {
    const stocks = [
      { beerDrinkId: 1, crates: 5 },
      { beerDrinkId: 2, crates: 0 },
    ];
    const parsed = beerStockFormSchema(stocks).safeParse({ beerDrinkId, crates });

    expect(parsed.success ? parsed.data : null).toEqual(expected);
  });
});

describe('beerPaymentFormSchema', () => {
  it.each([
    [
      [
        { beerDrinkId: 1, crates: 2 },
        { beerDrinkId: 2, crates: 0 },
      ],
      [{ beerDrinkId: 1, crates: 2 }],
    ],
    [
      [
        { beerDrinkId: 2, crates: 1 },
        { beerDrinkId: 1, crates: 3 },
      ],
      [
        { beerDrinkId: 1, crates: 3 },
        { beerDrinkId: 2, crates: 1 },
      ],
    ],
    [
      [
        { beerDrinkId: 1, crates: 0 },
        { beerDrinkId: 2, crates: 0 },
      ],
      null,
    ],
    [[], null],
  ])('picks %j → %j', (drinks, expected) => {
    const rows = [
      { beerDrinkId: 1, name: 'Veltins', open: 3 },
      { beerDrinkId: 2, name: 'Radler', open: 1 },
    ];
    const parsed = beerPaymentFormSchema(rows).safeParse({ drinks });

    expect(parsed.success ? parsed.data : null).toEqual(expected);
  });
});

describe('beerCratesFormSchema', () => {
  it.each([
    [
      [4, 7],
      { personId: '7', beerDrinkId: '2', count: '2', paid: true },
      { personId: 7, beerDrinkId: 2, count: 2, paid: true },
    ],
    [[4, 7], { personId: '7', beerDrinkId: '2', count: '6', paid: false }, null],
    [[4, 7], { personId: '7', beerDrinkId: '3', count: '3', paid: false }, null],
    [[4, 7], { personId: '7', beerDrinkId: '', count: '1', paid: false }, null],
    [[4, 7], { personId: '9', beerDrinkId: '2', count: '1', paid: false }, null],
    [[4, 7], { personId: '', beerDrinkId: '2', count: '1', paid: false }, null],
  ])('persons %j: %j → %j', (personIds, form, expected) => {
    const parsed = beerCratesFormSchema(personIds, [{ beerDrinkId: 2, maxCount: 5 }]).safeParse(
      form,
    );

    expect(parsed.success ? parsed.data : null).toEqual(expected);
  });
});

describe('BeerDrinkFormSchema', () => {
  it.each([
    [
      { name: '  Oberdorfer   Helles ', price: '17,5' },
      { name: 'Oberdorfer Helles', cratePriceCents: 1750 },
    ],
    [{ name: ' ', price: '18' }, null],
    [{ name: 'x'.repeat(41), price: '18' }, null],
    [{ name: 'Radler', price: '0' }, null],
  ])('%j → %j', (form, expected) => {
    const parsed = BeerDrinkFormSchema.safeParse(form);

    expect(parsed.success ? parsed.data : null).toEqual(expected);
  });
});

describe('BeerPotSettingsFormSchema', () => {
  it.each([
    [{ person: null, paymentLink: ' ', drinks: [] }, { paymentLink: null }],
    [{ person: null, paymentLink: ' https://p ', drinks: [] }, { paymentLink: 'https://p' }],
  ])('%j → %j', (form, expected) => {
    const parsed = BeerPotSettingsFormSchema.safeParse(form);

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
          { beerDrinkId: null, name: ' Radler', price: '15,50' },
        ],
      },
      {
        person: { personId: 3, firstName: 'A', lastName: 'B' },
        paymentLink: null,
        drinks: [
          { name: 'Veltins', cratePriceCents: 1800 },
          { name: 'Radler', cratePriceCents: 1550 },
        ],
      },
    ],
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
    [
      {
        person: { personId: 3, firstName: 'A', lastName: 'B' },
        paymentLink: '',
        drinks: [],
      },
      null,
    ],
    [
      {
        person: null,
        paymentLink: '',
        drinks: [{ beerDrinkId: null, name: 'Veltins', price: '18' }],
      },
      null,
    ],
  ])('%j → %j', (form, expected) => {
    const parsed = BeerPotOpeningFormSchema.safeParse(form);

    expect(parsed.success ? parsed.data : null).toEqual(expected);
  });
});

describe('BeerHandoverFormSchema', () => {
  it.each([
    [
      {
        person: { personId: 3, firstName: 'A', lastName: 'B' },
        paymentLink: 'https://p',
        drinks: [
          { beerDrinkId: 4, name: 'Veltins', price: '18' },
          { beerDrinkId: 6, name: 'Radler', price: '15,5' },
        ],
      },
      {
        person: { personId: 3, firstName: 'A', lastName: 'B' },
        paymentLink: 'https://p',
        drinks: [
          { beerDrinkId: 4, cratePriceCents: 1800 },
          { beerDrinkId: 6, cratePriceCents: 1550 },
        ],
      },
    ],
    [
      {
        person: { personId: 3, firstName: 'A', lastName: 'B' },
        paymentLink: '',
        drinks: [{ beerDrinkId: 4, name: 'Veltins', price: 'x' }],
      },
      null,
    ],
    [
      {
        person: null,
        paymentLink: 'https://p',
        drinks: [{ beerDrinkId: 4, name: 'Veltins', price: '18' }],
      },
      null,
    ],
  ])('%j → %j', (form, expected) => {
    const parsed = BeerHandoverFormSchema.safeParse(form);

    expect(parsed.success ? parsed.data : null).toEqual(expected);
  });
});

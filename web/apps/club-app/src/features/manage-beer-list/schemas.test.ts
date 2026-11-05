import { describe, expect, it } from 'vitest';
import {
  BeerHandoverFormSchema,
  BeerPotSettingsFormSchema,
  beerCratesFormSchema,
  beerPaymentFormSchema,
  beerStockFormSchema,
} from './schemas';

describe('beerStockFormSchema', () => {
  it.each([
    [5, '24', { kind: 'delivery', crates: 24 }],
    [5, '-2', { kind: 'correction', crates: -2 }],
    [5, '-5', { kind: 'correction', crates: -5 }],
    [5, '-6', null],
    [5, '+500', { kind: 'delivery', crates: 500 }],
    [5, '501', null],
    [5, '0', null],
    [5, 'x', null],
  ] as const)('stock %i, %s → %j', (stock, crates, expected) => {
    const parsed = beerStockFormSchema(stock).safeParse({ crates });

    expect(parsed.success ? parsed.data : null).toEqual(expected);
  });
});

describe('beerPaymentFormSchema', () => {
  it.each([
    [3, '2', 2],
    [3, '3', 3],
    [3, '4', null],
    [3, '0', null],
    [3, 'x', null],
  ])('with %i open crates, %s → %s', (openCrates, crates, expected) => {
    const parsed = beerPaymentFormSchema(openCrates).safeParse({ crates });

    expect(parsed.success ? parsed.data : null).toBe(expected);
  });
});

describe('beerCratesFormSchema', () => {
  it.each([
    [[4, 7], 5, { personId: '7', count: '2', paid: true }, { personId: 7, count: 2, paid: true }],
    [[4, 7], 5, { personId: '7', count: '6', paid: false }, null],
    [[4, 7], 5, { personId: '9', count: '1', paid: false }, null],
    [[4, 7], 5, { personId: '', count: '1', paid: false }, null],
  ])('persons %j, at most %i: %j → %j', (personIds, maxCount, form, expected) => {
    const parsed = beerCratesFormSchema(personIds, maxCount).safeParse(form);

    expect(parsed.success ? parsed.data : null).toEqual(expected);
  });
});

describe('BeerPotSettingsFormSchema', () => {
  it.each([
    [
      { person: null, cratePrice: '18,50', paymentLink: ' ' },
      { cratePriceCents: 1850, paymentLink: null },
    ],
    [
      { person: null, cratePrice: '18', paymentLink: ' https://p ' },
      { cratePriceCents: 1800, paymentLink: 'https://p' },
    ],
    [{ person: null, cratePrice: 'x', paymentLink: 'https://p' }, null],
  ])('%j → %j', (form, expected) => {
    const parsed = BeerPotSettingsFormSchema.safeParse(form);

    expect(parsed.success ? parsed.data : null).toEqual(expected);
  });
});

describe('BeerHandoverFormSchema', () => {
  it.each([
    [
      {
        person: { personId: 3, firstName: 'A', lastName: 'B' },
        cratePrice: '18',
        paymentLink: 'https://p',
      },
      {
        person: { personId: 3, firstName: 'A', lastName: 'B' },
        settings: { cratePriceCents: 1800, paymentLink: 'https://p' },
      },
    ],
    [{ person: null, cratePrice: '18', paymentLink: 'https://p' }, null],
  ])('%j → %j', (form, expected) => {
    const parsed = BeerHandoverFormSchema.safeParse(form);

    expect(parsed.success ? parsed.data : null).toEqual(expected);
  });
});

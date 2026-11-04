import { describe, expect, it } from 'vitest';
import {
  BeerHandoverFormSchema,
  BeerPotSettingsFormSchema,
  BeerStockFormSchema,
  beerCratesFormSchema,
  beerPaymentFormSchema,
} from './schemas';

describe('BeerStockFormSchema', () => {
  it.each([
    [
      { direction: 'up', cause: 'delivery', crates: '24' },
      { kind: 'delivery', crates: 24 },
    ],
    [
      { direction: 'down', cause: 'breakage', crates: '2' },
      { kind: 'correction', crates: -2, reason: 'breakage' },
    ],
    [{ direction: 'down', cause: 'delivery', crates: '2' }, null],
    [{ direction: 'up', cause: null, crates: '2' }, null],
    [{ direction: 'up', cause: 'delivery', crates: '0' }, null],
  ] as const)('%j → %j', (form, expected) => {
    const parsed = BeerStockFormSchema.safeParse(form);

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
      { person: null, cratePrice: '18,50', paymentLink: ' ', paymentNote: ' IBAN ' },
      { cratePriceCents: 1850, paymentLink: null, paymentNote: 'IBAN' },
    ],
    [{ person: null, cratePrice: '18', paymentLink: '', paymentNote: '' }, null],
    [{ person: null, cratePrice: 'x', paymentLink: 'https://p', paymentNote: '' }, null],
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
        paymentNote: '',
      },
      {
        person: { personId: 3, firstName: 'A', lastName: 'B' },
        settings: { cratePriceCents: 1800, paymentLink: 'https://p', paymentNote: null },
      },
    ],
    [{ person: null, cratePrice: '18', paymentLink: 'https://p', paymentNote: '' }, null],
  ])('%j → %j', (form, expected) => {
    const parsed = BeerHandoverFormSchema.safeParse(form);

    expect(parsed.success ? parsed.data : null).toEqual(expected);
  });
});

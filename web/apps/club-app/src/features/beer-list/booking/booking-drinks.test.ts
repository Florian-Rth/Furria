import { describe, expect, it } from 'vitest';
import type { BeerPotDrink } from '../schemas';
import { pickedDrinkOf } from './booking-drinks';

describe('pickedDrinkOf', () => {
  it.each<[string, BeerPotDrink[], number | null, number | null]>([
    [
      'the only drink is preselected',
      [
        {
          beerDrinkId: 1,
          name: 'Veltins',
          cratePriceCents: 1800,
          hasStock: true,
          isDefault: false,
        },
      ],
      null,
      1,
    ],
    [
      'the only drink in stock is preselected',
      [
        {
          beerDrinkId: 1,
          name: 'Veltins',
          cratePriceCents: 1800,
          hasStock: false,
          isDefault: false,
        },
        { beerDrinkId: 2, name: 'Radler', cratePriceCents: 1500, hasStock: true, isDefault: false },
      ],
      null,
      2,
    ],
    [
      'several drinks in stock wait for a pick',
      [
        {
          beerDrinkId: 1,
          name: 'Veltins',
          cratePriceCents: 1800,
          hasStock: true,
          isDefault: false,
        },
        { beerDrinkId: 2, name: 'Radler', cratePriceCents: 1500, hasStock: true, isDefault: false },
      ],
      null,
      null,
    ],
    [
      'the picked drink is kept',
      [
        {
          beerDrinkId: 1,
          name: 'Veltins',
          cratePriceCents: 1800,
          hasStock: true,
          isDefault: false,
        },
        { beerDrinkId: 2, name: 'Radler', cratePriceCents: 1500, hasStock: true, isDefault: false },
      ],
      2,
      2,
    ],
    [
      'a picked drink that ran out falls back to the one left',
      [
        {
          beerDrinkId: 1,
          name: 'Veltins',
          cratePriceCents: 1800,
          hasStock: true,
          isDefault: false,
        },
        {
          beerDrinkId: 2,
          name: 'Radler',
          cratePriceCents: 1500,
          hasStock: false,
          isDefault: false,
        },
      ],
      2,
      1,
    ],
    [
      'the default drink in stock is preselected',
      [
        {
          beerDrinkId: 1,
          name: 'Veltins',
          cratePriceCents: 1800,
          hasStock: true,
          isDefault: false,
        },
        { beerDrinkId: 2, name: 'Radler', cratePriceCents: 1500, hasStock: true, isDefault: true },
      ],
      null,
      2,
    ],
    [
      'a sold-out default falls back to the only drink in stock',
      [
        {
          beerDrinkId: 1,
          name: 'Veltins',
          cratePriceCents: 1800,
          hasStock: false,
          isDefault: true,
        },
        { beerDrinkId: 2, name: 'Radler', cratePriceCents: 1500, hasStock: true, isDefault: false },
      ],
      null,
      2,
    ],
    [
      'a sold-out default among several in stock waits for a pick',
      [
        {
          beerDrinkId: 1,
          name: 'Veltins',
          cratePriceCents: 1800,
          hasStock: false,
          isDefault: true,
        },
        { beerDrinkId: 2, name: 'Radler', cratePriceCents: 1500, hasStock: true, isDefault: false },
        { beerDrinkId: 3, name: 'Wasser', cratePriceCents: 900, hasStock: true, isDefault: false },
      ],
      null,
      null,
    ],
    [
      'a pick beats the default',
      [
        { beerDrinkId: 1, name: 'Veltins', cratePriceCents: 1800, hasStock: true, isDefault: true },
        { beerDrinkId: 2, name: 'Radler', cratePriceCents: 1500, hasStock: true, isDefault: false },
      ],
      2,
      2,
    ],
    [
      'nothing in stock picks nothing',
      [
        {
          beerDrinkId: 1,
          name: 'Veltins',
          cratePriceCents: 1800,
          hasStock: false,
          isDefault: false,
        },
      ],
      1,
      null,
    ],
  ])('%s', (_label, drinks, pickedId, expected) => {
    expect(pickedDrinkOf(drinks, pickedId)?.beerDrinkId ?? null).toBe(expected);
  });
});

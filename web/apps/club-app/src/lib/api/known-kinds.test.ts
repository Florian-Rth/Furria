import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { knownKindsOnly } from './known-kinds';

const KINDS = ['fee', 'key'] as const;

const ItemsSchema = knownKindsOnly(z.object({ kind: z.enum(KINDS), count: z.int() }), KINDS);

describe('knownKindsOnly', () => {
  it.each([
    {
      label: 'every kind is known',
      raw: [
        { kind: 'fee', count: 1 },
        { kind: 'key', count: 2 },
      ],
      expected: [
        { kind: 'fee', count: 1 },
        { kind: 'key', count: 2 },
      ],
    },
    {
      label: 'a kind arrived after this app was built',
      raw: [
        { kind: 'stockLow', count: 9 },
        { kind: 'key', count: 2 },
      ],
      expected: [{ kind: 'key', count: 2 }],
    },
    {
      label: 'an unknown kind carries a payload of its own',
      raw: [{ kind: 'photos', album: { id: 3 } }],
      expected: [],
    },
    { label: 'nothing arrived', raw: [], expected: [] },
  ])('keeps the known items in order when $label', ({ raw, expected }) => {
    expect(ItemsSchema.parse(raw)).toEqual(expected);
  });

  it('refuses a known kind whose payload is broken', () => {
    expect(() => ItemsSchema.parse([{ kind: 'fee', count: 'drei' }])).toThrow();
  });
});

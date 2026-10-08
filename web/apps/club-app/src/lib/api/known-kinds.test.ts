import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { knownKindsOnly } from './known-kinds';

const KINDS = ['fee', 'key'] as const;

const ItemsSchema = knownKindsOnly(z.object({ kind: z.enum(KINDS), count: z.int() }), KINDS);

describe('knownKindsOnly', () => {
  it('drops the kinds that arrived after this app was built, keeping the known ones in order', () => {
    expect(
      ItemsSchema.parse([
        { kind: 'key', count: 2 },
        { kind: 'photos', album: { id: 3 } },
        { kind: 'fee', count: 1 },
      ]),
    ).toEqual([
      { kind: 'key', count: 2 },
      { kind: 'fee', count: 1 },
    ]);
  });

  it('refuses a known kind whose payload is broken', () => {
    expect(() => ItemsSchema.parse([{ kind: 'fee', count: 'drei' }])).toThrow();
  });
});

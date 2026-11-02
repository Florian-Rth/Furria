import type { JsonBody } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { choreographyConflictOf } from './studio-conflict';

describe('choreographyConflictOf', () => {
  it.each<{ name: string; payload: JsonBody | null; found: boolean }>([
    { name: 'a plain refusal', payload: { errors: { conflict: ['x'] } }, found: false },
    { name: 'no overlaps', payload: { overlaps: [] }, found: false },
    { name: 'nothing', payload: null, found: false },
    {
      name: 'named overlaps',
      payload: { overlaps: [{ spotId: 30, keyframes: [{ sourceMediaItemId: 11, seconds: 2 }] }] },
      found: true,
    },
  ])('finds overlaps in $name: $found', ({ payload, found }) => {
    expect(choreographyConflictOf(payload) !== null).toBe(found);
  });
});

import { describe, expect, it } from 'vitest';
import { toActLineActor } from './act-line';

describe('toActLineActor', () => {
  it.each([
    {
      label: 'another person acted',
      actor: { personId: 4, firstName: 'Anna', lastName: 'Kessler' },
      viewerPersonId: 7,
      expected: { kind: 'other', firstName: 'Anna' },
    },
    {
      label: 'the viewer acted herself',
      actor: { personId: 7, firstName: 'Paula', lastName: 'Brendel' },
      viewerPersonId: 7,
      expected: { kind: 'viewer' },
    },
    {
      label: 'the viewer is not known',
      actor: { personId: 7, firstName: 'Paula', lastName: 'Brendel' },
      viewerPersonId: null,
      expected: { kind: 'other', firstName: 'Paula' },
    },
    { label: 'the actor is gone', actor: null, viewerPersonId: 7, expected: { kind: 'nobody' } },
  ])('names $expected.kind when $label', ({ actor, viewerPersonId, expected }) => {
    expect(toActLineActor(actor, viewerPersonId)).toEqual(expected);
  });
});

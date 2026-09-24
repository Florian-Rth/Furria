import type { KkScreenOrigin } from '@furria/ui';
import { describe, expect, it } from 'vitest';
import { toOriginHref } from './origin-href';

describe('toOriginHref', () => {
  it.each<{ label: string; origin: KkScreenOrigin; expected: string }>([
    {
      label: 'a route with no params',
      origin: { label: 'Verein', to: '/club' },
      expected: '/club',
    },
    {
      label: 'a single path param',
      origin: { label: 'Annika Adam', to: '/groups/$groupId', params: { groupId: '4' } },
      expected: '/groups/4',
    },
    {
      label: 'two path params',
      origin: {
        label: 'Zeitraum',
        to: '/groups/$groupId/people/$personId',
        params: { groupId: '4', personId: '9' },
      },
      expected: '/groups/4/people/9',
    },
  ])('resolves $label', ({ origin, expected }) => {
    expect(toOriginHref(origin)).toBe(expected);
  });
});

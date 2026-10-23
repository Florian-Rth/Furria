import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
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
      label: 'two path params',
      origin: {
        label: 'Zeitraum',
        to: '/groups/$groupId/people/$personId',
        params: { groupId: '4', personId: '9' },
      },
      expected: '/groups/4/people/9',
    },
    {
      label: 'a path param and a search',
      origin: {
        label: 'Sitzung',
        to: '/events/$eventId',
        params: { eventId: '16' },
        search: { step: 'runningOrder' },
      },
      expected: '/events/16?step=runningOrder',
    },
    {
      label: 'an empty search',
      origin: { label: 'Verein', to: '/club', search: {} },
      expected: '/club',
    },
  ])('resolves $label', ({ origin, expected }) => {
    expect(toOriginHref(origin)).toBe(expected);
  });
});

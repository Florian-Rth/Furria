import { describe, expect, it } from 'vitest';
import type { CatalogueAct } from '@/features/running-order/schemas';
import type { ActPageReturn } from './acts-origin';
import { actPageReturnOf, actPageSearchOf, playerOriginOf } from './acts-origin';
import type { ActPageSearch } from './schemas';

const act = (groupId: number | null): CatalogueAct => ({
  actId: 5,
  name: 'Gardetanz',
  kind: 'dance',
  group:
    groupId === null ? null : { groupId, name: 'Garde', tone: null, icon: null, picture: null },
  sessionYear: 2026,
  closed: false,
  archived: false,
  cast: [],
  added: [],
  removed: [],
  wishes: [],
});

describe('actPageReturnOf', () => {
  it.each<[string, ActPageSearch, CatalogueAct | null, ActPageReturn]>([
    ['catalogue without state', { from: 'catalogue' }, act(3), { kind: 'catalogue', list: {} }],
    [
      'catalogue with its list state',
      { from: 'catalogue', event: 12, filter: 'dance', person: 4, session: 2024 },
      act(3),
      {
        kind: 'catalogue',
        list: { from: '12', filter: 'dance', person: '4', session: '2024' },
      },
    ],
    [
      'group acts with a filter',
      { from: 'groupActs', group: 3, filter: 'archive' },
      null,
      { kind: 'groupActs', groupId: 3, list: { filter: 'archive' } },
    ],
    [
      'group hub named in the link',
      { from: 'group', group: 8 },
      act(3),
      { kind: 'group', groupId: 8 },
    ],
    ['group hub of the act', { from: 'group' }, act(3), { kind: 'group', groupId: 3 }],
    ['start', { from: 'start', group: 3 }, act(3), { kind: 'start' }],
    ['no origin, grouped act', {}, act(3), { kind: 'group', groupId: 3 }],
    ['no origin, act without group', {}, act(null), { kind: 'start' }],
  ])('%s', (_label, search, given, expected) => {
    expect(actPageReturnOf(search, given)).toEqual(expected);
  });
});

describe('playerOriginOf', () => {
  const away = { label: 'Start', to: '/' };

  it('closes back to the act details it was opened from, keeping how the act was reached', () => {
    const origin = playerOriginOf(
      5,
      { from: 'start', evening: 9, edit: true, training: 4, view: 'training' },
      { pathname: '/acts/5', search: '?from=start&view=details' },
      away,
    );

    expect([origin.params, origin.search]).toEqual([
      { actId: '5' },
      { from: 'start', evening: '9', view: 'details' },
    ]);
  });

  it.each([
    ['opened directly', undefined],
    ['opened from elsewhere', { pathname: '/groups/1', search: '' }],
    ['opened from the same act playing', { pathname: '/acts/5', search: '?from=start' }],
    ['opened from another act', { pathname: '/acts/6', search: '?view=details' }],
  ])('closes to where the act was reached from when %s', (_, behind) => {
    expect(playerOriginOf(5, { from: 'start' }, behind, away)).toBe(away);
  });
});

describe('actPageSearchOf', () => {
  it('carries the catalogue state so the way back restores it', () => {
    const search = actPageSearchOf(
      { kind: 'group', groupId: 3 },
      { from: 12, filter: 'show', person: 4, session: 2025 },
    );

    expect(actPageReturnOf(search, null)).toEqual({
      kind: 'groupActs',
      groupId: 3,
      list: { from: '12', filter: 'show', person: '4', session: '2025' },
    });
  });
});

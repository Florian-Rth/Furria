import { describe, expect, it } from 'vitest';
import type { CatalogueAct } from '@/features/running-order/schemas';
import type { ActPageReturn, ActsCatalogueAccess, ActsCatalogueReturn } from './acts-origin';
import { actPageReturnOf, actPageSearchOf, actsCatalogueReturnOf } from './acts-origin';
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

describe('actsCatalogueReturnOf', () => {
  const planner: ActsCatalogueAccess = { plans: true, managesEvents: false };
  const eventManager: ActsCatalogueAccess = { plans: true, managesEvents: true };
  const outsider: ActsCatalogueAccess = { plans: false, managesEvents: false };

  it.each<[string, number | undefined, ActsCatalogueAccess, ActsCatalogueReturn]>([
    ['a planner coming from an evening', 12, planner, { kind: 'planner', eventId: 12 }],
    ['an event manager without an evening', undefined, eventManager, { kind: 'events' }],
    ['a planner who may not manage events', undefined, planner, { kind: 'more' }],
    ['someone without planner rights', 12, outsider, { kind: 'start' }],
  ])('%s', (_label, from, access, expected) => {
    expect(actsCatalogueReturnOf(from, access)).toEqual(expected);
  });
});

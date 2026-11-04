import { describe, expect, it } from 'vitest';
import { beerPaneKeyOf, beerPaneOf } from './beer-pane';

describe('beerPaneOf', () => {
  it.each([
    ['/_app/manage/beer-list/stock', {}, {}, { kind: 'stock' }],
    ['/_app/manage/beer-list/payment', {}, {}, { kind: 'payment', personId: null }],
    ['/_app/manage/beer-list/payment', {}, { person: 7 }, { kind: 'payment', personId: 7 }],
    ['/_app/manage/beer-list/crates', {}, { person: 3 }, { kind: 'crates', personId: 3 }],
    ['/_app/manage/beer-list/crates', {}, { person: -1 }, { kind: 'crates', personId: null }],
    ['/_app/manage/beer-list/settings', {}, {}, { kind: 'settings' }],
    ['/_app/manage/beer-list/enrollments', {}, {}, { kind: 'enrollments' }],
    ['/_app/manage/beer-list/handover', {}, {}, { kind: 'handover' }],
    ['/_app/manage/beer-list/code', {}, {}, { kind: 'code' }],
    ['/_app/manage/beer-list/pots', {}, {}, { kind: 'pots' }],
    [
      '/_app/manage/beer-list/persons/$personId',
      { personId: '12' },
      {},
      { kind: 'person', personId: 12 },
    ],
    ['/_app/manage/beer-list/persons/$personId', { personId: 'x' }, {}, null],
    [
      '/_app/manage/beer-list/pots_/$beerPotId',
      { beerPotId: '4' },
      {},
      { kind: 'closedPot', beerPotId: 4 },
    ],
    ['/_app/manage/beer-list/pots_/$beerPotId', { beerPotId: '0' }, {}, null],
    ['/_app/manage/beer-list/', {}, {}, null],
  ])('%s %j %j → %j', (routeId, params, search, expected) => {
    expect(beerPaneOf({ routeId, params, search })).toEqual(expected);
  });

  it('has no pane without a child match', () => {
    expect(beerPaneOf(undefined)).toBeNull();
  });
});

describe('beerPaneKeyOf', () => {
  it.each([
    [{ kind: 'payment', personId: 1 }, { kind: 'payment', personId: 1 }, true],
    [{ kind: 'payment', personId: 1 }, { kind: 'payment', personId: 2 }, false],
    [{ kind: 'payment', personId: null }, { kind: 'crates', personId: null }, false],
    [{ kind: 'person', personId: 5 }, { kind: 'closedPot', beerPotId: 5 }, false],
    [{ kind: 'stock' }, { kind: 'stock' }, true],
    [{ kind: 'stock' }, null, false],
  ] as const)('%j and %j share a key: %s', (left, right, same) => {
    expect(beerPaneKeyOf(left) === beerPaneKeyOf(right)).toBe(same);
  });
});

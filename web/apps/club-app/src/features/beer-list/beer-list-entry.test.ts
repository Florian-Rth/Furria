import { describe, expect, it } from 'vitest';
import type { StartBeerTab } from '@/features/start/schemas';
import type { PermissionKey } from '@/lib/api/schemas';
import type { BeerListEntry } from './beer-list-entry';
import { beerListEntryOf } from './beer-list-entry';

const openTab = (beerPotId: number, openCents: number): StartBeerTab => ({
  beerPotId,
  openCrates: 1,
  openCents,
  oldestOpenBookedAt: '2026-11-01T10:00:00Z',
  owner: null,
  paymentLink: null,
});

describe('beerListEntryOf', () => {
  it.each<{ keys: PermissionKey[]; tabs: StartBeerTab[]; expected: BeerListEntry }>([
    {
      keys: ['beer_list.take'],
      tabs: [],
      expected: { standing: 'taker', openCents: 0 },
    },
    {
      keys: ['beer_list.take', 'beer_list.manage'],
      tabs: [openTab(2, 1800)],
      expected: { standing: 'taker', openCents: 1800 },
    },
    {
      keys: ['beer_list.manage'],
      tabs: [],
      expected: { standing: 'keeper', openCents: 0 },
    },
    {
      keys: ['club.read'],
      tabs: [openTab(2, 1800), openTab(1, 3000)],
      expected: { standing: 'former', openCents: 4800 },
    },
    {
      keys: ['club.read'],
      tabs: [],
      expected: { standing: 'none', openCents: 0 },
    },
  ])('$keys with $tabs.length open tabs → $expected.standing', ({ keys, tabs, expected }) => {
    expect(beerListEntryOf(keys, tabs)).toEqual(expected);
  });
});

import type { StartBeerTab } from '@/features/start/schemas';
import type { PermissionKey } from '@/lib/api/schemas';
import type { BeerListStanding } from './beer-list-standing';
import { beerListStandingOf } from './beer-list-standing';

export interface BeerListEntry {
  standing: BeerListStanding;
  openCents: number;
}

export const beerListEntryOf = (
  keys: readonly PermissionKey[],
  openTabs: readonly StartBeerTab[],
): BeerListEntry => ({
  standing: beerListStandingOf(keys, openTabs.length > 0),
  openCents: openTabs.reduce((sum, tab) => sum + tab.openCents, 0),
});

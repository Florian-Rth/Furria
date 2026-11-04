import { usePermissions } from '@/features/session/hooks/use-permissions';
import { useStartBeerTabsQuery } from '@/features/start/api';
import type { StartBeerTab } from '@/features/start/schemas';
import { formatEuroCents } from '@/lib/money';
import { BEER_LIST_META, openMeta } from '../beer-list-copy';
import { beerListEntryOf } from '../beer-list-entry';

const NO_TABS: readonly StartBeerTab[] = [];

export interface BeerListEntryView {
  visible: boolean;
  meta: string;
}

export const useBeerListEntry = (): BeerListEntryView => {
  const { keys } = usePermissions();
  const openTabs = useStartBeerTabsQuery();
  const entry = beerListEntryOf(keys, openTabs.data ?? NO_TABS);

  return {
    visible: entry.standing !== 'none',
    meta: entry.openCents === 0 ? BEER_LIST_META : openMeta(formatEuroCents(entry.openCents)),
  };
};

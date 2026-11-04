import { useBeerJournalQuery, useBeerPotsQuery, useBeerTabsQuery } from '../api';
import { openCratesOf } from '../beer-hub';
import type { BeerPotSummary } from '../schemas';
import type { PaymentTarget } from './use-payment-form';

export type ClosedPotPane =
  | { kind: 'loading' }
  | { kind: 'failed'; error: Error; retry: () => void }
  | { kind: 'ready'; pot: BeerPotSummary | null; owing: readonly PaymentTarget[] };

export const useClosedPotPane = (beerPotId: number): ClosedPotPane => {
  const potsQuery = useBeerPotsQuery();
  const tabsQuery = useBeerTabsQuery(beerPotId);
  const journalQuery = useBeerJournalQuery(beerPotId);
  const pots = potsQuery.data?.pots;
  const tabs = tabsQuery.data?.tabs;
  const crates = journalQuery.data?.crates;
  const error =
    (pots === undefined ? potsQuery.error : null) ??
    (tabs === undefined ? tabsQuery.error : null) ??
    (crates === undefined ? journalQuery.error : null);

  if (error !== null) {
    return {
      kind: 'failed',
      error,
      retry: () => {
        void potsQuery.refetch();
        void tabsQuery.refetch();
        void journalQuery.refetch();
      },
    };
  }

  if (pots === undefined || tabs === undefined || crates === undefined) {
    return { kind: 'loading' };
  }

  return {
    kind: 'ready',
    pot: pots.find((entry) => entry.beerPotId === beerPotId) ?? null,
    owing: tabs
      .filter((tab) => tab.openCrates > 0)
      .map((tab) => ({
        beerPotId,
        person: tab.person,
        oldestFirst: openCratesOf(crates, tab.person.personId),
      })),
  };
};

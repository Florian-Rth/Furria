import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCloseOnEscape } from '@/features/events/hooks/use-close-on-escape';
import { useActsQuery, useRunningOrdersQuery } from '@/features/running-order/api';
import type { ActsResponse, CatalogueAct } from '@/features/running-order/schemas';
import { appRouteApi } from '@/features/session/app-route';
import { useNow } from '@/lib/use-now';
import type { ActSection, ActsScope } from '../acts-catalogue';
import { filterCountsOf, scopedActsOf, visibleSectionsOf } from '../acts-catalogue';
import { PLANNER_PATH } from '../acts-origin';
import type { ActOverlap, PersonLoad } from '../acts-overlap';
import { carriersAmongOf, overlapsOf, personInActsOf, personLoadsOf } from '../acts-overlap';
import { upcomingRunsOf } from '../acts-runs';
import type { ActSelection, ActsFilter, ActsSearch } from '../schemas';
import { NEW_ACT } from '../schemas';

const NO_ACTS: readonly CatalogueAct[] = [];
const CLOCK_MS = 60_000;

export interface ActsHub {
  query: UseQueryResult<ActsResponse, Error>;
  scope: ActsScope;
  acts: readonly CatalogueAct[];
  filter: ActsFilter;
  counts: Record<ActsFilter, number>;
  sections: ActSection[];
  overlaps: Map<number, ActOverlap>;
  runs: Map<number, number>;
  people: number;
  carriers: PersonLoad[];
  spotlight: PersonLoad | null;
  selection: ActSelection | null;
  selectedAct: CatalogueAct | null;
  isWide: boolean;
  fromEventId: number | null;
  chooseFilter: (filter: ActsFilter) => void;
  open: (actId: number) => void;
  openNew: () => void;
  close: () => void;
  created: (actId: number) => void;
  toggleSpotlight: (personId: number) => void;
  clearSpotlight: () => void;
  reload: () => void;
}

export const useActsHub = (scope: ActsScope, search: ActsSearch): ActsHub => {
  const query = useActsQuery();
  const runningOrders = useRunningOrdersQuery();
  const { q } = appRouteApi.useSearch();
  const navigate = useNavigate();
  const isWide = useIsWideScreen();
  const now = useNow(CLOCK_MS);
  const all = query.data?.acts ?? NO_ACTS;
  const acts = scopedActsOf(all, scope);
  const filter = search.filter ?? 'all';
  const selection = search.act ?? null;
  const selectedAct =
    typeof selection === 'number' ? (acts.find((act) => act.actId === selection) ?? null) : null;
  const spotlightId = search.person ?? null;

  const go = (patch: Partial<ActsSearch>, replace: boolean): void => {
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, ...patch }),
      replace,
      resetScroll: false,
    });
  };
  const close = (): void => {
    go({ act: undefined }, true);
  };

  useCloseOnEscape(isWide && selection !== null, close);

  return {
    query,
    scope,
    acts,
    filter,
    counts: filterCountsOf(acts),
    sections: visibleSectionsOf(acts, filter, q ?? null),
    overlaps: overlapsOf(all),
    runs: upcomingRunsOf(runningOrders.data?.runningOrders ?? [], now),
    people: personLoadsOf(acts).length,
    carriers: carriersAmongOf(all, acts),
    spotlight: personInActsOf(spotlightId, all),
    selection,
    selectedAct,
    isWide,
    fromEventId: search.from ?? null,
    chooseFilter: (next) => {
      go({ filter: next === 'all' ? undefined : next }, true);
    },
    open: (actId) => {
      go({ act: actId }, selection !== null);
    },
    openNew: () => {
      go({ act: NEW_ACT }, selection !== null);
    },
    close,
    created: (actId) => {
      if (search.from === undefined) {
        go({ act: actId }, true);
        return;
      }

      void navigate({
        to: PLANNER_PATH,
        params: { eventId: String(search.from) },
        search: { mode: 'pick' },
      });
    },
    toggleSpotlight: (personId) => {
      go({ person: personId === spotlightId ? undefined : personId }, true);
    },
    clearSpotlight: () => {
      go({ person: undefined }, true);
    },
    reload: () => {
      void query.refetch();
    },
  };
};

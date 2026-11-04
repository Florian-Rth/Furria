import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import { useChildMatches, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useCloseOnEscape } from '@/features/events/hooks/use-close-on-escape';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import {
  useBeerEnrollmentsQuery,
  useBeerJournalQuery,
  useBeerStockQuery,
  useBeerTabsQuery,
  useOpenBeerPotQuery,
} from '../api';
import type {
  BeerFocus,
  BeerHubSummary,
  BeerJournalDay,
  BeerKindFilter,
  BeerRosterRow,
} from '../beer-hub';
import {
  filteredJournalOf,
  hubSummaryOf,
  journalDaysOf,
  journalOf,
  rosterInFocus,
  rosterOf,
} from '../beer-hub';
import { HUB_PATH } from '../beer-hub-copy';
import { dayKeyOf } from '../beer-time';
import type { BeerEnrollment, BeerJournalCrate, BeerJournalPayment, OpenBeerPot } from '../schemas';

const INDEX_ROUTE_ID = '/_app/manage/beer-list/';
const NO_ENROLLMENTS: readonly BeerEnrollment[] = [];

export type BeerPanePath =
  | '/manage/beer-list/stock'
  | '/manage/beer-list/payment'
  | '/manage/beer-list/crates'
  | '/manage/beer-list/settings'
  | '/manage/beer-list/enrollments'
  | '/manage/beer-list/handover'
  | '/manage/beer-list/code'
  | '/manage/beer-list/pots';

export interface BeerOpenHub {
  pot: OpenBeerPot;
  roster: readonly BeerRosterRow[];
  focusRoster: readonly BeerRosterRow[];
  summary: BeerHubSummary;
  crates: readonly BeerJournalCrate[];
  payments: readonly BeerJournalPayment[];
  days: readonly BeerJournalDay[];
}

export type BeerHubState =
  | { kind: 'loading' }
  | { kind: 'failed'; error: Error }
  | { kind: 'empty' }
  | { kind: 'open'; open: BeerOpenHub };

export interface BeerHub {
  state: BeerHubState;
  allowed: boolean;
  isWide: boolean;
  now: string;
  todayKey: string;
  enrollments: readonly BeerEnrollment[];
  paneOpen: boolean;
  selectedPersonId: number | null;
  focus: BeerFocus;
  chooseFocus: (focus: BeerFocus) => void;
  kind: BeerKindFilter;
  chooseKind: (kind: BeerKindFilter) => void;
  personFilter: number | null;
  choosePerson: (personId: number | null) => void;
  filterPerson: (personId: number) => void;
  openPane: (path: BeerPanePath, personId?: number) => void;
  openPerson: (personId: number) => void;
  closePane: () => void;
  reload: () => void;
}

const firstError = (errors: readonly (Error | null)[]): Error | null =>
  errors.find((error) => error !== null) ?? null;

export const useBeerHub = (): BeerHub => {
  const isWide = useIsWideScreen();
  const navigate = useNavigate();
  const childMatches = useChildMatches();
  const [focus, setFocus] = useState<BeerFocus>('all');
  const [kind, setKind] = useState<BeerKindFilter>('all');
  const [personFilter, setPersonFilter] = useState<number | null>(null);
  const { has } = usePermissions();
  const allowed = has(PERMISSION_KEYS.beerListManage);
  const potQuery = useOpenBeerPotQuery(allowed);
  const beerPotId = potQuery.data?.pot?.beerPotId ?? null;
  const enrollmentsQuery = useBeerEnrollmentsQuery(allowed);
  const stockQuery = useBeerStockQuery(beerPotId);
  const tabsQuery = useBeerTabsQuery(beerPotId);
  const journalQuery = useBeerJournalQuery(beerPotId);
  const now = new Date().toISOString();
  const enrollments = enrollmentsQuery.data?.enrollments ?? NO_ENROLLMENTS;
  const paneMatch = childMatches.find((match) => match.routeId !== INDEX_ROUTE_ID);
  const personParam = paneMatch?.params;
  const selectedPersonId =
    personParam !== undefined && 'personId' in personParam ? Number(personParam.personId) : null;

  const closePane = (): void => {
    void navigate({ to: HUB_PATH, resetScroll: false });
  };

  useCloseOnEscape(isWide && paneMatch !== undefined, closePane);

  const stateOf = (): BeerHubState => {
    const pot = potQuery.data?.pot;
    const error = firstError([
      pot === undefined ? potQuery.error : null,
      enrollmentsQuery.data === undefined ? enrollmentsQuery.error : null,
      stockQuery.data === undefined ? stockQuery.error : null,
      tabsQuery.data === undefined ? tabsQuery.error : null,
      journalQuery.data === undefined ? journalQuery.error : null,
    ]);

    if (pot === null) {
      return { kind: 'empty' };
    }
    if (error !== null) {
      return { kind: 'failed', error };
    }
    if (
      pot === undefined ||
      enrollmentsQuery.data === undefined ||
      stockQuery.data === undefined ||
      tabsQuery.data === undefined ||
      journalQuery.data === undefined
    ) {
      return { kind: 'loading' };
    }

    const roster = rosterOf(tabsQuery.data.tabs, enrollments, now);
    const focusRoster = rosterInFocus(roster, focus);
    const journal = journalOf({
      journal: journalQuery.data,
      movements: stockQuery.data.movements,
      enrollments,
      since: pot.openedAt,
    });
    const shown = filteredJournalOf(journal, {
      kind,
      personId: personFilter,
      focus,
      focusPersonIds: new Set(focusRoster.map((row) => row.person.personId)),
    });

    return {
      kind: 'open',
      open: {
        pot,
        roster,
        focusRoster,
        summary: hubSummaryOf({
          stock: stockQuery.data,
          crates: journalQuery.data.crates,
          roster,
          now,
        }),
        crates: journalQuery.data.crates,
        payments: journalQuery.data.payments,
        days: journalDaysOf(shown),
      },
    };
  };

  return {
    state: stateOf(),
    allowed,
    isWide,
    now,
    todayKey: dayKeyOf(now),
    enrollments,
    paneOpen: paneMatch !== undefined,
    selectedPersonId,
    focus,
    chooseFocus: (next) => {
      setFocus(next === focus ? 'all' : next);
    },
    kind,
    chooseKind: setKind,
    personFilter,
    choosePerson: setPersonFilter,
    filterPerson: (personId) => {
      setPersonFilter(personId);

      if (!isWide) {
        closePane();
      }
    },
    openPane: (path, personId) => {
      void navigate({
        to: path,
        search: personId === undefined ? {} : { person: personId },
        resetScroll: false,
      });
    },
    openPerson: (personId) => {
      void navigate({
        to: '/manage/beer-list/persons/$personId',
        params: { personId: String(personId) },
        resetScroll: false,
      });
    },
    closePane,
    reload: () => {
      void potQuery.refetch();
      void enrollmentsQuery.refetch();
      void stockQuery.refetch();
      void tabsQuery.refetch();
      void journalQuery.refetch();
    },
  };
};

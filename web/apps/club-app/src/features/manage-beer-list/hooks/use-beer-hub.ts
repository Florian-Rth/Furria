import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import { useChildMatches, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { OpenBeerPot } from '@/features/beer-list/schemas';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useCloseOnEscape } from '@/lib/use-close-on-escape';
import { useMinuteNow } from '@/lib/use-minute-now';
import {
  useBeerEnrollmentsQuery,
  useBeerJournalQuery,
  useBeerStockQuery,
  useBeerTabsQuery,
  useHubBeerPotQuery,
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
import type { BeerPane } from '../beer-pane';
import { beerPaneOf } from '../beer-pane';
import { dayKeyOf } from '../beer-time';
import type { BeerEnrollment, BeerJournalCrate, BeerJournalPayment } from '../schemas';

const NO_ENROLLMENTS: readonly BeerEnrollment[] = [];

export type BeerPanePath =
  | '/beer-list/manage/stock'
  | '/beer-list/manage/payment'
  | '/beer-list/manage/crates'
  | '/beer-list/manage/settings'
  | '/beer-list/manage/enrollments'
  | '/beer-list/manage/handover'
  | '/beer-list/manage/code'
  | '/beer-list/manage/pots';

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
  pane: BeerPane | null;
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
  const potQuery = useHubBeerPotQuery(allowed);
  const beerPotId = potQuery.data?.pot?.beerPotId ?? null;
  const enrollmentsQuery = useBeerEnrollmentsQuery(allowed);
  const stockQuery = useBeerStockQuery(beerPotId);
  const tabsQuery = useBeerTabsQuery(beerPotId);
  const journalQuery = useBeerJournalQuery(beerPotId);
  const now = useMinuteNow().toISOString();
  const enrollments = enrollmentsQuery.data?.enrollments ?? NO_ENROLLMENTS;
  const pane = beerPaneOf(childMatches[0]);
  const selectedPersonId = pane?.kind === 'person' ? pane.personId : null;

  const closePane = (): void => {
    void navigate({ to: HUB_PATH, resetScroll: false });
  };

  useCloseOnEscape(isWide && pane !== null, closePane);

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
    pane,
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
        to: '/beer-list/manage/persons/$personId',
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

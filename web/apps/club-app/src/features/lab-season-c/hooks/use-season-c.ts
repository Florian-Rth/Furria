import type { KkFilterOption } from '@furria/ui/filter-chip-entries';
import { useState } from 'react';
import { useActsQuery } from '@/features/running-order/api';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { useActSeasonQuery, useSeasonToggleMutation } from '@/features/season/api';
import type { ReadinessCheck, SeasonAct, SeasonEvening } from '@/features/season/schemas';
import { readinessOf } from '@/features/season/season-grid';
import {
  CHECK_LABELS,
  FILTER_ALL,
  FILTER_OPEN,
  toActMeta,
  toDotLabel,
  toDotText,
  toEveningCount,
  toEveningDay,
  toEveningPlace,
  toReadinessLabel,
  toReadinessText,
  toScreenHeading,
  toSessionLabel,
} from '../season-c-copy';
import type { CheckMark, DotKind } from '../season-c-rows';
import {
  ALL_FILTER,
  byReadiness,
  checkStatesOf,
  dotOf,
  eveningsOfSession,
  eveningTallyOf,
  filteredActs,
  groupFiltersOf,
  OPEN_FILTER,
} from '../season-c-rows';

export interface SeasonCCheck {
  check: ReadinessCheck;
  label: string;
  mark: CheckMark;
}

export interface SeasonCDot {
  eventId: number;
  kind: DotKind;
  text: string;
  label: string;
  pending: boolean;
  toggle: () => void;
}

export interface SeasonCRow {
  actId: number;
  name: string;
  meta: string;
  done: number;
  total: number;
  readinessText: string;
  readinessLabel: string;
  checks: SeasonCCheck[];
  selected: boolean;
  select: () => void;
  dots: SeasonCDot[];
}

export interface SeasonCEvening {
  eventId: number;
  place: string;
  day: string;
  title: string;
  count: string;
  confirmed: boolean;
}

export interface SeasonCSelection {
  act: SeasonAct;
  catalogueAct: CatalogueAct | null;
  evenings: SeasonEvening[];
  toggle: (eventId: number) => void;
  pendingEventId: number | null;
}

export interface SeasonCState {
  heading: string;
  isLoading: boolean;
  isFailed: boolean;
  retry: () => void;
  filter: string;
  filterOptions: KkFilterOption[];
  setFilter: (id: string) => void;
  session: string;
  sessionOptions: KkFilterOption[];
  setSession: (id: string) => void;
  evenings: SeasonCEvening[];
  rows: SeasonCRow[];
  selection: SeasonCSelection | null;
  closeSelection: () => void;
}

const NO_ACTS: readonly SeasonAct[] = [];
const NO_EVENINGS: readonly SeasonEvening[] = [];

export const useSeasonC = (): SeasonCState => {
  const [sessionYear, setSessionYear] = useState<number | null>(null);
  const [filter, setFilter] = useState(OPEN_FILTER);
  const [selectedActId, setSelectedActId] = useState<number | null>(null);
  const season = useActSeasonQuery(sessionYear);
  const catalogue = useActsQuery(sessionYear);
  const toggleMutation = useSeasonToggleMutation();

  const acts = season.data?.acts ?? NO_ACTS;
  const evenings = eveningsOfSession(season.data?.evenings ?? NO_EVENINGS);
  const catalogueActOf = (actId: number): CatalogueAct | null =>
    catalogue.data?.acts.find((candidate) => candidate.actId === actId) ?? null;
  const pending = toggleMutation.isPending ? (toggleMutation.variables ?? null) : null;
  const pendingEventOf = (actId: number): number | null =>
    pending !== null && pending.act.actId === actId ? pending.eventId : null;

  const toggle = (act: SeasonAct, evening: SeasonEvening): void => {
    const catalogueAct = catalogueActOf(act.actId);
    if (catalogueAct === null || pending !== null) {
      return;
    }
    toggleMutation.mutate({
      act: catalogueAct,
      eventId: evening.eventId,
      eveningTitle: evening.title,
      add: dotOf(act, evening.eventId).kind === 'none',
    });
  };

  const rows = byReadiness(filteredActs(acts, filter)).map((act): SeasonCRow => {
    const readiness = readinessOf(act);
    const pendingEventId = pendingEventOf(act.actId);

    return {
      actId: act.actId,
      name: act.name,
      meta: toActMeta(act.group?.name ?? null, act.castCount),
      done: readiness.done,
      total: readiness.total,
      readinessText: toReadinessText(readiness.done, readiness.total),
      readinessLabel: toReadinessLabel(act.name, readiness.done, readiness.total),
      checks: checkStatesOf(act).map(({ check, mark }) => ({
        check,
        label: CHECK_LABELS[check],
        mark,
      })),
      selected: act.actId === selectedActId,
      select: () => {
        setSelectedActId((current) => (current === act.actId ? null : act.actId));
      },
      dots: evenings.map((evening) => {
        const dot = dotOf(act, evening.eventId);

        return {
          eventId: evening.eventId,
          kind: dot.kind,
          text: toDotText(dot.kind, dot.number),
          label: toDotLabel(act.name, evening.title, dot.kind, dot.number),
          pending: pendingEventId === evening.eventId,
          toggle: () => {
            toggle(act, evening);
          },
        };
      }),
    };
  });

  const selectedAct = acts.find((act) => act.actId === selectedActId) ?? null;
  const groups = groupFiltersOf(acts);

  return {
    heading: toScreenHeading(season.data?.sessionYear ?? sessionYear),
    isLoading: season.isPending,
    isFailed: season.isError,
    retry: () => {
      void season.refetch();
    },
    filter,
    filterOptions: [
      {
        id: OPEN_FILTER,
        label: FILTER_OPEN,
        count: filteredActs(acts, OPEN_FILTER).length,
      },
      { id: ALL_FILTER, label: FILTER_ALL, count: acts.length },
      ...groups.map((group) => ({ id: group.id, label: group.name, count: group.count })),
    ],
    setFilter,
    session: String(season.data?.sessionYear ?? sessionYear ?? ''),
    sessionOptions: (season.data?.sessionYears ?? []).map((year) => ({
      id: String(year),
      label: toSessionLabel(year),
    })),
    setSession: (id) => {
      setSessionYear(Number(id));
      setSelectedActId(null);
    },
    evenings: evenings.map((evening, index) => {
      const tally = eveningTallyOf(acts, evening.eventId);

      return {
        eventId: evening.eventId,
        place: toEveningPlace(index + 1, evenings.length),
        day: toEveningDay(evening.startsAt),
        title: evening.title,
        count: toEveningCount(tally.placed, tally.tray),
        confirmed: evening.confirmed,
      };
    }),
    rows,
    selection:
      selectedAct === null
        ? null
        : {
            act: selectedAct,
            catalogueAct: catalogueActOf(selectedAct.actId),
            evenings,
            toggle: (eventId) => {
              const evening = evenings.find((candidate) => candidate.eventId === eventId);
              if (evening !== undefined) {
                toggle(selectedAct, evening);
              }
            },
            pendingEventId: pendingEventOf(selectedAct.actId),
          },
    closeSelection: () => {
      setSelectedActId(null);
    },
  };
};

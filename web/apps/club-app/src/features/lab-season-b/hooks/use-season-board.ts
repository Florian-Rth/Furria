import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import type { UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { useActsQuery } from '@/features/running-order/api';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { useActSeasonQuery, useSeasonToggleMutation } from '@/features/season/api';
import type { ActSeasonResponse } from '@/features/season/schemas';
import { toEveningDate } from '../season-b-copy';
import type { EveningColumn, IndexEntry } from '../season-columns';
import { actIndexOf, eveningColumnsOf, lineKeyOf, navigationGridOf } from '../season-columns';

export interface SeasonBoard {
  query: UseQueryResult<ActSeasonResponse, Error>;
  sessionChoices: KkChoiceChip[];
  sessionValue: string | null;
  chooseSession: (id: string) => void;
  columns: EveningColumn[];
  index: IndexEntry[];
  grid: string[][];
  todayEventId: number | null;
  markedActId: number | null;
  markedName: string | null;
  mark: (actId: number) => void;
  clearMark: () => void;
  openLineKey: string | null;
  toggleLine: (key: string) => void;
  closeLine: () => void;
  catalogueActOf: (actId: number) => CatalogueAct | null;
  isToggling: (eventId: number, actId: number) => boolean;
  toggle: (eventId: number, actId: number, add: boolean) => void;
  indexOpen: boolean;
  openIndex: () => void;
  closeIndex: () => void;
}

const NO_COLUMNS: EveningColumn[] = [];
const NO_INDEX: IndexEntry[] = [];

export const useSeasonBoard = (): SeasonBoard => {
  const [sessionYear, setSessionYear] = useState<number | null>(null);
  const [markedActId, setMarkedActId] = useState<number | null>(null);
  const [openLineKey, setOpenLineKey] = useState<string | null>(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const query = useActSeasonQuery(sessionYear);
  const season = query.data;
  const catalogue = useActsQuery(season?.sessionYear ?? null, season !== undefined);
  const toggleMutation = useSeasonToggleMutation();
  const columns = season === undefined ? NO_COLUMNS : eveningColumnsOf(season);
  const index = season === undefined ? NO_INDEX : actIndexOf(season);
  const today = toEveningDate(new Date().toISOString());
  const todayColumn = columns.find((column) => toEveningDate(column.evening.startsAt) === today);
  const marked = index.find((entry) => entry.act.actId === markedActId);
  const pending = toggleMutation.isPending ? toggleMutation.variables : undefined;

  const catalogueActOf = (actId: number): CatalogueAct | null =>
    catalogue.data?.acts.find((act) => act.actId === actId) ?? null;

  return {
    query,
    sessionChoices: (season?.sessionYears ?? []).map((year) => ({
      id: String(year),
      label: String(year),
    })),
    sessionValue: season === undefined ? null : String(season.sessionYear),
    chooseSession: (id) => {
      setSessionYear(Number(id));
      setOpenLineKey(null);
      setMarkedActId(null);
    },
    columns,
    index,
    grid: navigationGridOf(index, columns),
    todayEventId: todayColumn?.evening.eventId ?? null,
    markedActId: marked === undefined ? null : markedActId,
    markedName: marked?.act.name ?? null,
    mark: (actId) => {
      setMarkedActId((current) => (current === actId ? null : actId));
      setIndexOpen(false);
    },
    clearMark: () => {
      setMarkedActId(null);
      setIndexOpen(false);
    },
    openLineKey,
    toggleLine: (key) => {
      setOpenLineKey((current) => (current === key ? null : key));
    },
    closeLine: () => {
      setOpenLineKey(null);
    },
    catalogueActOf,
    isToggling: (eventId, actId) =>
      pending !== undefined && pending.eventId === eventId && pending.act.actId === actId,
    toggle: (eventId, actId, add) => {
      const act = catalogueActOf(actId);
      const column = columns.find((candidate) => candidate.evening.eventId === eventId);
      if (act === null || column === undefined) {
        return;
      }
      if (!add && openLineKey === lineKeyOf(eventId, actId)) {
        setOpenLineKey(null);
      }
      toggleMutation.mutate({ act, eventId, eveningTitle: column.evening.title, add });
    },
    indexOpen,
    openIndex: () => {
      setIndexOpen(true);
    },
    closeIndex: () => {
      setIndexOpen(false);
    },
  };
};

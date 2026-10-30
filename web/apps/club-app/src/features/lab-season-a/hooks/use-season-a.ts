import type { KkFilterOption } from '@furria/ui/filter-chip-entries';
import type { UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { useActsQuery } from '@/features/running-order/api';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { useActSeasonQuery, useSeasonToggleMutation } from '@/features/season/api';
import type { ActSeasonResponse, SeasonAct, SeasonEvening } from '@/features/season/schemas';
import { cellOf } from '@/features/season/season-grid';
import { toRasterMeta, toSeasonTitle, toSessionOption } from '../season-a-copy';
import type { RasterActRow, RasterOrder, RasterRow, RasterSpot } from '../season-raster';
import { lineCountOf, rasterRowsOf } from '../season-raster';

export interface SeasonSelection {
  actId: number;
  eventId: number;
}

export interface SeasonPick {
  act: SeasonAct;
  evening: SeasonEvening;
  catalogue: CatalogueAct | null;
}

export interface SeasonA {
  query: UseQueryResult<ActSeasonResponse, Error>;
  title: string;
  meta: string;
  sessionOptions: KkFilterOption[];
  sessionValue: string;
  chooseSession: (id: string) => void;
  order: RasterOrder;
  chooseOrder: (id: string) => void;
  acts: readonly SeasonAct[];
  rows: RasterRow[];
  evenings: SeasonEvening[];
  lineCount: number;
  selection: SeasonSelection | null;
  pick: SeasonPick | null;
  open: (spot: RasterSpot) => void;
  close: () => void;
  toggle: (act: SeasonAct, evening: SeasonEvening) => void;
  isToggling: (actId: number, eventId: number) => boolean;
  canToggle: (actId: number) => boolean;
}

const NO_EVENINGS: readonly SeasonEvening[] = [];
const NO_ACTS: readonly SeasonAct[] = [];
const ORDERS: readonly RasterOrder[] = ['group', 'ready', 'name'];

const isOrder = (id: string): id is RasterOrder => ORDERS.some((order) => order === id);

const actRowsOf = (rows: readonly RasterRow[]): RasterActRow[] =>
  rows.filter((row): row is RasterActRow => row.kind === 'act');

export const useSeasonA = (): SeasonA => {
  const [sessionYear, setSessionYear] = useState<number | null>(null);
  const [order, setOrder] = useState<RasterOrder>('group');
  const [selection, setSelection] = useState<SeasonSelection | null>(null);
  const query = useActSeasonQuery(sessionYear);
  const data = query.data;
  const catalogue = useActsQuery(data?.sessionYear ?? sessionYear, data !== undefined);
  const toggleMutation = useSeasonToggleMutation();
  const acts = data?.acts ?? NO_ACTS;
  const evenings = [...(data?.evenings ?? NO_EVENINGS)];
  const rows = rasterRowsOf(acts, order);
  const actRows = actRowsOf(rows);
  const catalogueOf = (actId: number): CatalogueAct | null =>
    catalogue.data?.acts.find((candidate) => candidate.actId === actId) ?? null;
  const pickedAct = acts.find((act) => act.actId === selection?.actId);
  const pickedEvening = evenings.find((evening) => evening.eventId === selection?.eventId);
  const pending = toggleMutation.isPending ? toggleMutation.variables : undefined;

  return {
    query,
    title: data === undefined ? '' : toSeasonTitle(data.sessionYear),
    meta: toRasterMeta(acts.length, evenings.length),
    sessionOptions: (data?.sessionYears ?? []).map(toSessionOption),
    sessionValue: data === undefined ? '' : String(data.sessionYear),
    chooseSession: (id) => {
      setSessionYear(Number(id));
      setSelection(null);
    },
    order,
    chooseOrder: (id) => {
      if (isOrder(id)) {
        setOrder(id);
      }
    },
    acts,
    rows,
    evenings,
    lineCount: lineCountOf(rows),
    selection,
    pick:
      pickedAct === undefined || pickedEvening === undefined
        ? null
        : { act: pickedAct, evening: pickedEvening, catalogue: catalogueOf(pickedAct.actId) },
    open: ({ line, column }) => {
      const act = actRows[line]?.act;
      const evening = evenings[column];
      if (act !== undefined && evening !== undefined) {
        setSelection({ actId: act.actId, eventId: evening.eventId });
      }
    },
    close: () => {
      setSelection(null);
    },
    toggle: (act, evening) => {
      const catalogueAct = catalogueOf(act.actId);
      if (catalogueAct === null || toggleMutation.isPending) {
        return;
      }
      toggleMutation.mutate({
        act: catalogueAct,
        eventId: evening.eventId,
        eveningTitle: evening.title,
        add: cellOf(act, evening.eventId).state === 'none',
      });
    },
    isToggling: (actId, eventId) =>
      pending !== undefined && pending.act.actId === actId && pending.eventId === eventId,
    canToggle: (actId) => catalogueOf(actId) !== null && !toggleMutation.isPending,
  };
};

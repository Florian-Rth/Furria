import type {
  ActSeasonResponse,
  SeasonAct,
  SeasonAppearance,
  SeasonEvening,
} from '@/features/season/schemas';
import type { Readiness } from '@/features/season/season-grid';
import { cellOf, eveningCountOf, readinessOf } from '@/features/season/season-grid';

export interface ColumnLine {
  key: string;
  act: SeasonAct;
  number: number | null;
  adjusted: boolean;
  appearance: SeasonAppearance;
  readiness: Readiness;
}

export interface ColumnAbsentAct {
  key: string;
  act: SeasonAct;
  readiness: Readiness;
}

export interface EveningColumn {
  evening: SeasonEvening;
  lines: ColumnLine[];
  tray: ColumnLine[];
  absent: ColumnAbsentAct[];
}

export interface IndexEntry {
  key: string;
  act: SeasonAct;
  readiness: Readiness;
  evenings: number;
}

export type MarkPlace = { state: 'placed'; number: number } | { state: 'tray' } | { state: 'none' };

export const lineKeyOf = (eventId: number, actId: number): string => `${eventId}:${actId}`;

export const indexKeyOf = (actId: number): string => `act:${actId}`;

const byName = (left: SeasonAct, right: SeasonAct): number =>
  left.name.localeCompare(right.name, 'de');

const byNumber = (left: ColumnLine, right: ColumnLine): number =>
  (left.number ?? 0) - (right.number ?? 0);

const lineOf = (act: SeasonAct, eventId: number): ColumnLine | null => {
  const cell = cellOf(act, eventId);

  return cell.appearance === null
    ? null
    : {
        key: lineKeyOf(eventId, act.actId),
        act,
        number: cell.number,
        adjusted: cell.adjusted,
        appearance: cell.appearance,
        readiness: readinessOf(act),
      };
};

const columnOf = (acts: readonly SeasonAct[], evening: SeasonEvening): EveningColumn => {
  const sorted = [...acts].sort(byName);
  const lines = sorted.flatMap((act) => {
    const line = lineOf(act, evening.eventId);
    return line === null ? [] : [line];
  });

  return {
    evening,
    lines: lines.filter((line) => line.number !== null).sort(byNumber),
    tray: lines.filter((line) => line.number === null),
    absent: sorted
      .filter((act) => cellOf(act, evening.eventId).state === 'none')
      .map((act) => ({
        key: lineKeyOf(evening.eventId, act.actId),
        act,
        readiness: readinessOf(act),
      })),
  };
};

export const eveningColumnsOf = (season: ActSeasonResponse): EveningColumn[] =>
  season.evenings.map((evening) => columnOf(season.acts, evening));

export const actIndexOf = (season: ActSeasonResponse): IndexEntry[] =>
  [...season.acts].sort(byName).map((act) => ({
    key: indexKeyOf(act.actId),
    act,
    readiness: readinessOf(act),
    evenings: eveningCountOf(act),
  }));

export const markPlaceOf = (column: EveningColumn, actId: number): MarkPlace => {
  const line = column.lines.find((candidate) => candidate.act.actId === actId);
  if (line !== undefined && line.number !== null) {
    return { state: 'placed', number: line.number };
  }

  return column.tray.some((candidate) => candidate.act.actId === actId)
    ? { state: 'tray' }
    : { state: 'none' };
};

export const navigationGridOf = (
  index: readonly IndexEntry[],
  columns: readonly EveningColumn[],
): string[][] => [
  index.map((entry) => entry.key),
  ...columns.map((column) => [
    ...column.lines.map((line) => line.key),
    ...column.tray.map((line) => line.key),
    ...column.absent.map((entry) => entry.key),
  ]),
];

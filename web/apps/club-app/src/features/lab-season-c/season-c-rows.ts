import type { ReadinessCheck, SeasonAct, SeasonEvening } from '@/features/season/schemas';
import { READINESS_CHECKS } from '@/features/season/schemas';
import { cellOf, eveningCountOf, readinessOf } from '@/features/season/season-grid';

export const OPEN_FILTER = 'open';
export const ALL_FILTER = 'all';
const GROUP_FILTER_PREFIX = 'group-';

export type DotKind = 'placed' | 'tray' | 'adjusted' | 'none';

export interface SeasonDot {
  kind: DotKind;
  number: number | null;
}

export type CheckMark = 'done' | 'open' | 'none';

export interface CheckState {
  check: ReadinessCheck;
  mark: CheckMark;
}

export interface GroupFilter {
  id: string;
  name: string;
  count: number;
}

export interface EveningTally {
  placed: number;
  tray: number;
  adjusted: number;
}

const byName = (left: SeasonAct, right: SeasonAct): number =>
  left.name.localeCompare(right.name, 'de');

export const groupFilterIdOf = (groupId: number): string => `${GROUP_FILTER_PREFIX}${groupId}`;

const shareOf = (act: SeasonAct): number => {
  const readiness = readinessOf(act);

  return readiness.total === 0 ? 1 : readiness.done / readiness.total;
};

export const byReadiness = (acts: readonly SeasonAct[]): SeasonAct[] =>
  [...acts].sort(
    (left, right) =>
      shareOf(left) - shareOf(right) ||
      eveningCountOf(right) - eveningCountOf(left) ||
      byName(left, right),
  );

export const filteredActs = (acts: readonly SeasonAct[], filter: string): SeasonAct[] => {
  if (filter === ALL_FILTER) {
    return [...acts];
  }
  if (filter === OPEN_FILTER) {
    return acts.filter((act) => !readinessOf(act).ready);
  }

  return acts.filter((act) => act.group !== null && groupFilterIdOf(act.group.groupId) === filter);
};

export const groupFiltersOf = (acts: readonly SeasonAct[]): GroupFilter[] => {
  const groups = new Map<number, GroupFilter>();
  for (const act of acts) {
    if (act.group !== null) {
      const known = groups.get(act.group.groupId);
      groups.set(act.group.groupId, {
        id: groupFilterIdOf(act.group.groupId),
        name: act.group.name,
        count: (known?.count ?? 0) + 1,
      });
    }
  }

  return [...groups.values()].sort((left, right) => left.name.localeCompare(right.name, 'de'));
};

export const dotOf = (act: SeasonAct, eventId: number): SeasonDot => {
  const cell = cellOf(act, eventId);
  if (cell.state === 'none') {
    return { kind: 'none', number: null };
  }
  if (cell.adjusted) {
    return { kind: 'adjusted', number: cell.number };
  }

  return { kind: cell.state, number: cell.number };
};

export const eveningTallyOf = (acts: readonly SeasonAct[], eventId: number): EveningTally =>
  acts.reduce<EveningTally>(
    (tally, act) => {
      const cell = cellOf(act, eventId);

      return {
        placed: tally.placed + (cell.state === 'placed' ? 1 : 0),
        tray: tally.tray + (cell.state === 'tray' ? 1 : 0),
        adjusted: tally.adjusted + (cell.adjusted ? 1 : 0),
      };
    },
    { placed: 0, tray: 0, adjusted: 0 },
  );

const markOf = (act: SeasonAct, check: ReadinessCheck): CheckMark => {
  const entry = act.readiness.find((candidate) => candidate.check === check);
  if (entry === undefined) {
    return 'none';
  }

  return entry.done ? 'done' : 'open';
};

export const checkStatesOf = (act: SeasonAct): CheckState[] =>
  READINESS_CHECKS.map((check) => ({ check, mark: markOf(act, check) }));

export const isOnEvening = (act: SeasonAct, eventId: number): boolean =>
  cellOf(act, eventId).state !== 'none';

export const eveningsOfSession = (evenings: readonly SeasonEvening[]): SeasonEvening[] =>
  [...evenings].sort((left, right) => left.startsAt.localeCompare(right.startsAt));

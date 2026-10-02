import type { Start, StartEntry, StartPanel } from './schemas';
import type { QuietMemory } from './start-quiet';
import { isQuiet } from './start-quiet';
import type { StartVisit } from './start-visit';
import { itemKeyOf, reconcileFrozenVisit, toStartVisit } from './start-visit';

export type StartScreen =
  | { kind: 'waiting' | 'skeleton' | 'offline' | 'error' | 'inactive' | 'empty' }
  | { kind: 'board'; start: Start };

export interface StartScreenInput {
  start: Start | null;
  failed: boolean;
  paused: boolean;
  skeletonDue: boolean;
}

export interface VisitHold {
  source: Start | undefined;
  visit: StartVisit | null;
  frozen: boolean;
  touched: ReadonlySet<string>;
}

export interface CalendarRow {
  entry: StartEntry;
  previousStartsAt: string | null;
  dimmed: boolean;
}

const VISIT_IDLE_MS = 10 * 60 * 1000;
const SINGLE_HIDDEN = 1;

export const startScreenOf = ({
  start,
  failed,
  paused,
  skeletonDue,
}: StartScreenInput): StartScreen => {
  if (start !== null) {
    if (!start.viewerIsActiveInClub) {
      return { kind: 'inactive' };
    }

    return start.panels.length === 0 ? { kind: 'empty' } : { kind: 'board', start };
  }
  if (failed) {
    return { kind: 'error' };
  }
  if (paused) {
    return { kind: 'offline' };
  }

  return { kind: skeletonDue ? 'skeleton' : 'waiting' };
};

export const toShownCount = (shownCount: number, total: number): number => {
  const shown = Math.min(shownCount, total);

  return total - shown === SINGLE_HIDDEN ? total : shown;
};

export const panelSizeOf = (panel: StartPanel): number => {
  if (panel.kind === 'calendar') {
    return panel.entries.length;
  }
  if (panel.kind === 'announcements') {
    return panel.announcements.length;
  }
  if (panel.kind === 'mine') {
    return panel.mine.length;
  }
  if (panel.kind === 'groups') {
    return panel.groupMoments.length;
  }

  return panel.toDos.length;
};

const isHeld =
  (memory: QuietMemory, today: string, touched: ReadonlySet<string>) =>
  (key: string): boolean =>
    touched.has(key) || !isQuiet(memory, key, today);

const quietPanelOf = (panel: StartPanel, held: (key: string) => boolean): StartPanel => {
  if (panel.kind === 'mine') {
    const mine = panel.mine.filter((item) => held(itemKeyOf({ panel: 'mine', ...item })));

    return { ...panel, mine, shownCount: toShownCount(panel.shownCount, mine.length) };
  }
  if (panel.kind === 'groups') {
    const groupMoments = panel.groupMoments.filter((moment) =>
      held(itemKeyOf({ panel: 'groups', ...moment })),
    );

    return {
      ...panel,
      groupMoments,
      shownCount: toShownCount(panel.shownCount, groupMoments.length),
    };
  }

  return { ...panel, shownCount: toShownCount(panel.shownCount, panelSizeOf(panel)) };
};

export const withoutQuiet = (
  start: Start,
  memory: QuietMemory,
  touched: ReadonlySet<string>,
): Start => {
  const held = isHeld(memory, start.today, touched);

  return {
    ...start,
    panels: start.panels
      .map((panel) => quietPanelOf(panel, held))
      .filter((panel) => panelSizeOf(panel) > 0),
  };
};

export const toCalendarRows = (
  entries: readonly StartEntry[],
  dimmedKeys: ReadonlySet<string>,
): CalendarRow[] =>
  entries.map((entry, index) => ({
    entry,
    previousStartsAt: entries[index - 1]?.startsAt ?? null,
    dimmed: dimmedKeys.has(itemKeyOf({ panel: 'calendar', ...entry })),
  }));

export const byStartsAt = (entries: readonly StartEntry[]): StartEntry[] =>
  [...entries].sort(
    (first, second) =>
      Date.parse(first.startsAt) - Date.parse(second.startsAt) ||
      first.calendarEntryId - second.calendarEntryId,
  );

export const isVisitOver = (hiddenSinceMs: number, nowMs: number): boolean =>
  nowMs - hiddenSinceMs >= VISIT_IDLE_MS;

export const openVisitHold = (fresh: Start | undefined): VisitHold => ({
  source: fresh,
  visit: fresh === undefined ? null : toStartVisit(fresh),
  frozen: false,
  touched: new Set(),
});

export const nextVisitHold = (hold: VisitHold, fresh: Start | undefined): VisitHold => {
  if (fresh === undefined) {
    return { ...hold, source: fresh };
  }
  if (hold.visit === null || !hold.frozen) {
    return { ...hold, source: fresh, visit: toStartVisit(fresh) };
  }

  return { ...hold, source: fresh, visit: reconcileFrozenVisit(hold.visit, fresh, hold.touched) };
};

export const sheetHeldVisitHold = (hold: VisitHold, sheetOpen: boolean): VisitHold =>
  sheetOpen && !hold.frozen && hold.visit !== null ? { ...hold, frozen: true } : hold;

export const touchedVisitHold = (hold: VisitHold, key: string): VisitHold =>
  hold.touched.has(key) && hold.frozen
    ? hold
    : { ...hold, frozen: true, touched: new Set([...hold.touched, key]) };

export type StartPanelOf<TKind extends StartPanel['kind']> = Extract<StartPanel, { kind: TKind }>;

export const hiddenCountOf = (panel: StartPanel): number =>
  Math.max(0, panelSizeOf(panel) - panel.shownCount);

export const shownItemsOf = <TItem>(items: readonly TItem[], shownCount: number): TItem[] =>
  items.slice(0, shownCount);

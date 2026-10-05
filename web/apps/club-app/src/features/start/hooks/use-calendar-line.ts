import type { KkAnswer, KkDenseFacet, KkDenseLineState, KkGroupTone } from '@furria/ui';
import { useKkSheetCommands } from '@furria/ui';
import { useId, useState } from 'react';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import { toPeekId } from '@/lib/peek';
import type { StartEntry } from '../schemas';
import type { EntryStamp } from '../start-labels';
import {
  isEntryRunningAt,
  toEntryAccessibleName,
  toRunningProgress,
  toStampOf,
} from '../start-labels';
import type { EntryTrailing } from '../start-lines';
import { toCalendarTick, toEntryLineState, toEntryMeta, toEntryTrailing } from '../start-lines';
import { useEntryAnswer } from './use-entry-answer';

export interface CalendarLineInput {
  entry: StartEntry;
  previousStartsAt: string | null;
  now: Date;
  dimmed: boolean;
  expanded: boolean;
  onToggle: (calendarEntryId: number) => void;
  onCollapse: (calendarEntryId: number) => void;
  onTouch: (key: string) => void;
}

export interface CalendarLineView {
  stamp: EntryStamp;
  running: boolean;
  meta: KkDenseFacet[];
  tick: KkGroupTone | undefined;
  state: KkDenseLineState;
  progress: number | null;
  accessibleLabel: string;
  alert: string | undefined;
  highlight: boolean;
  trailing: EntryTrailing;
  choosing: boolean;
  choiceId: string;
  ringLabel: string;
  choiceLabel: string;
  markLabel: string;
  value: KkAnswer | null;
  open: () => void;
  toggle: () => void;
  collapse: () => void;
  choose: (answer: KkAnswer) => void;
}

const NO_TRAILING: EntryTrailing = { kind: 'none' };

const shapeOf = (entry: StartEntry): string =>
  `${entry.startsAt}|${entry.endsAt ?? ''}|${entry.venue?.venueId ?? ''}`;

const useShapeChange = (shape: string): boolean => {
  const [held, setHeld] = useState({ shape, changed: false });

  if (held.shape !== shape) {
    setHeld({ shape, changed: true });
  }

  return held.changed;
};

export const useCalendarLine = ({
  entry,
  previousStartsAt,
  now,
  dimmed,
  expanded,
  onToggle,
  onCollapse,
  onTouch,
}: CalendarLineInput): CalendarLineView => {
  const sheet = useKkSheetCommands();
  const choiceId = useId();
  const highlight = useShapeChange(shapeOf(entry));
  const { calendarEntryId, title } = entry;

  const collapse = (): void => {
    onCollapse(calendarEntryId);
  };

  const answer = useEntryAnswer({ calendarEntryId, onTouch, onHeld: collapse });
  const running = isEntryRunningAt(entry, now);
  const inert = dimmed || answer.dims;
  const value = entry.attendance?.viewerAnswer ?? null;
  const choosing = !inert && (expanded || answer.holding);

  return {
    stamp: toStampOf(entry, now, previousStartsAt),
    running,
    meta: toEntryMeta(entry),
    tick: toCalendarTick(entry) ?? undefined,
    state: toEntryLineState(running, inert),
    progress: running ? toRunningProgress(entry, now) : null,
    accessibleLabel: toEntryAccessibleName(entry, now),
    alert: answer.failure,
    highlight,
    trailing: inert ? NO_TRAILING : toEntryTrailing(entry.attendance),
    choosing,
    choiceId,
    ringLabel: `Zu- oder Absage für ${title}`,
    choiceLabel: `Deine Antwort für ${title}`,
    markLabel: value === null ? '' : `Deine Antwort: ${ATTENDANCE_LABELS[value]}`,
    value,
    open: () => {
      sheet.open(toPeekId('entry', calendarEntryId));
    },
    toggle: () => {
      onToggle(calendarEntryId);
    },
    collapse,
    choose: answer.choose,
  };
};

import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { AttendanceAnswer } from '@/features/attendance';
import { usePendingAnswers } from '@/features/attendance';
import { useLanding } from '@/features/write';
import { toIsoDay } from '@/lib/day';
import { useCalendarQuery } from '../api';
import type { CalendarLine, CalendarSection, CalendarWindow } from '../calendar-agenda';
import {
  earlierWindowOf,
  fetchSpanOf,
  initialWindowOf,
  laterWindowOf,
  leadEntryOf,
  linesByDay,
  monthStartOf,
  owedIdsOf,
  toCalendarSections,
  windowCovering,
} from '../calendar-agenda';
import { gridSpanOf } from '../calendar-fold';
import type { CalendarEntry, CalendarSearch } from '../schemas';

const routeApi = getRouteApi('/_app/calendar');
const NO_ENTRIES: readonly CalendarEntry[] = [];

export type CalendarPhase = 'loading' | 'failed' | 'ready';

export interface CalendarBoard {
  phase: CalendarPhase;
  isFetching: boolean;
  retry: () => void;
  todayDay: string;
  nowMs: number;
  window: CalendarWindow;
  entries: readonly CalendarEntry[];
  allEntries: readonly CalendarEntry[];
  pending: ReadonlyMap<number, AttendanceAnswer>;
  sections: readonly CalendarSection[];
  byDay: ReadonlyMap<string, readonly CalendarLine[]>;
  owedIds: ReadonlySet<number>;
  landingDay: string | null;
  highlightedKey: string | null;
  selectedId: number | null;
  leadId: number | null;
  canEarlier: boolean;
  canLater: boolean;
  loadEarlier: () => void;
  loadLater: () => void;
  cover: (isoDay: string) => void;
  peek: (month: string) => void;
  select: (calendarEntryId: number) => void;
  close: () => void;
}

export const useCalendarBoard = (): CalendarBoard => {
  const search = routeApi.useSearch();
  const navigate = useNavigate();
  const [today] = useState(() => new Date());
  const todayDay = toIsoDay(today);
  const nowMs = today.getTime();
  const landingDay = search.day ?? null;
  const [window, setWindow] = useState(() => initialWindowOf(todayDay, landingDay));
  const [peeked, setPeeked] = useState(() => gridSpanOf(monthStartOf(landingDay ?? todayDay)));
  const span = fetchSpanOf(window, peeked);
  const query = useCalendarQuery({ scope: 'all', groupId: null, from: span.from, to: span.to });
  const pending = usePendingAnswers();
  const { highlightedKey } = useLanding();
  const all = query.data?.entries ?? NO_ENTRIES;
  const owedIds = owedIdsOf(all, nowMs, pending);

  const entries = all;

  const patch = (next: Partial<CalendarSearch>): void => {
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, ...next }),
      replace: true,
      resetScroll: false,
    });
  };

  const phase: CalendarPhase =
    query.data !== undefined ? 'ready' : query.isError ? 'failed' : 'loading';
  const earlier = earlierWindowOf(window);
  const later = laterWindowOf(window);

  return {
    phase,
    isFetching: query.isFetching,
    retry: () => {
      void query.refetch();
    },
    todayDay,
    nowMs,
    window,
    entries,
    allEntries: all,
    pending,
    sections: toCalendarSections(entries, window, todayDay),
    byDay: linesByDay(entries, span),
    owedIds: new Set(owedIds),
    landingDay,
    highlightedKey,
    selectedId: search.entry ?? null,
    leadId: leadEntryOf(entries, nowMs, landingDay)?.calendarEntryId ?? null,
    canEarlier: earlier !== null,
    canLater: later !== null,
    loadEarlier: () => {
      if (earlier !== null) {
        setWindow(earlier);
      }
    },
    loadLater: () => {
      if (later !== null && !query.isFetching) {
        setWindow(later);
      }
    },
    cover: (isoDay) => {
      const next = windowCovering(window, isoDay);

      if (next.from !== window.from || next.to !== window.to) {
        setWindow(next);
      }
    },
    peek: (month) => {
      const grid = gridSpanOf(month);

      if (grid.from < peeked.from || grid.to > peeked.to) {
        setPeeked({
          from: grid.from < peeked.from ? grid.from : peeked.from,
          to: grid.to > peeked.to ? grid.to : peeked.to,
        });
      }
    },
    select: (calendarEntryId) => {
      patch({ entry: calendarEntryId });
    },
    close: () => {
      patch({ entry: undefined });
    },
  };
};

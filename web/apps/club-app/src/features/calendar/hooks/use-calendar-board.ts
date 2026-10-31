import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { usePendingAnswers } from '@/features/attendance/hooks/use-pending-answers';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { useLanding } from '@/features/write/hooks/use-landing';
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
  usualsByDay,
  windowCovering,
} from '../calendar-agenda';
import { gridSpanOf } from '../calendar-fold';
import type { CalendarEntry, CalendarSearch, UsualTraining } from '../schemas';
import { toUsualTrainingDraft } from '../training-draft';
import { useCalendarAuthoring } from './use-calendar-authoring';

const routeApi = getRouteApi('/_app/calendar');
const NO_ENTRIES: readonly CalendarEntry[] = [];
const NO_USUALS: readonly UsualTraining[] = [];

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
  usuals: readonly UsualTraining[];
  usualDays: ReadonlyMap<string, readonly UsualTraining[]>;
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
  mayPlan: (groupId: number) => boolean;
  planTraining: (usual: UsualTraining) => void;
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
  const { authoring } = useCalendarAuthoring();
  const ownerOptions = authoring?.ownerOptions ?? [];
  const { highlightedKey } = useLanding();
  const all = query.data?.entries ?? NO_ENTRIES;
  const usuals = query.data?.usualTrainings ?? NO_USUALS;
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
    sections: toCalendarSections(entries, usuals, window, todayDay),
    byDay: linesByDay(entries, span),
    usuals,
    usualDays: usualsByDay(usuals, span),
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
    mayPlan: (groupId) => ownerOptions.some((option) => option.ownerGroupId === groupId),
    planTraining: (usual) => {
      void navigate({ to: '/calendar/new', search: toUsualTrainingDraft(usual) });
    },
  };
};

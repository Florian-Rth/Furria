import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useScreenWakeLock } from '@/features/act-training/hooks/use-screen-wake-lock';
import { useEveningLiveQuery, useLiveMoveMutation } from '@/features/live/api';
import type { LiveState } from '@/features/live/live-flow';
import {
  backMoveOf,
  elapsedSecondsOf,
  forwardMoveOf,
  liveFlowOf,
  peopleToCallOf,
} from '@/features/live/live-flow';
import type { LiveLine, LivePerson } from '@/features/live/schemas';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  BEFORE_TITLE,
  ENDED_TITLE,
  NOTHING_NEXT,
  toAblaufEntry,
  toAblaufOpen,
  toCallMeta,
  toCallSpan,
  toEveningClock,
  toHeading,
  toMissingLine,
  toOrderCount,
  toPersonName,
  toPosition,
  toWeiterCaption,
} from '../heute-c-copy';
import type { AblaufState, WeiterKind } from '../heute-c-view';
import {
  ablaufOf,
  calledKeyOf,
  elapsedTextOf,
  isOverrunError,
  lineCastOf,
  positionTextOf,
  weiterKindOf,
} from '../heute-c-view';
import { useCalledMarks } from './use-called-marks';
import { useHeuteKeys } from './use-heute-keys';
import { useNowMs } from './use-now-ms';

export interface HeuteCName {
  key: number;
  name: string;
  standsIn: boolean;
}

export interface HeuteCAct {
  name: string;
  position: string;
  names: HeuteCName[];
  missingLine: string | null;
}

export interface HeuteCEntry {
  key: number;
  text: string;
  state: AblaufState;
}

export interface HeuteCCall {
  key: string;
  name: string;
  span: string;
  meta: string;
  called: boolean;
  toggle: () => void;
}

export interface HeuteCState {
  isLoading: boolean;
  isFailed: boolean;
  heading: string;
  clock: string;
  canDirect: boolean;
  now: HeuteCAct | null;
  nowElapsed: string | null;
  next: HeuteCAct | null;
  afterName: string | null;
  stateTitle: string | null;
  stateText: string;
  isEmpty: boolean;
  entries: HeuteCEntry[];
  currentIndex: number | null;
  ablaufOpenText: string;
  isAblaufOpen: boolean;
  openAblauf: () => void;
  closeAblauf: () => void;
  calls: HeuteCCall[];
  weiterKind: WeiterKind;
  weiterCaption: string;
  canForward: boolean;
  canBack: boolean;
  isMoving: boolean;
  isOverrun: boolean;
  moveError: string | null;
  forward: () => void;
  back: () => void;
  close: () => void;
}

const NO_LINES: readonly LiveLine[] = [];

const STATE_TITLES: Record<LiveState, string | null> = {
  before: BEFORE_TITLE,
  running: null,
  ended: ENDED_TITLE,
};

const nameOf = (person: LivePerson): string => toPersonName(person.firstName, person.lastName);

const actOf = (line: LiveLine | null, total: number): HeuteCAct | null => {
  if (line === null) {
    return null;
  }
  const cast = lineCastOf(line);

  return {
    name: line.name,
    position: toPosition(line.position + 1, total),
    names: [
      ...cast.present.map((person) => ({
        key: person.personId,
        name: nameOf(person),
        standsIn: false,
      })),
      ...cast.standIns.map((person) => ({
        key: person.personId,
        name: nameOf(person),
        standsIn: true,
      })),
    ],
    missingLine: cast.missing.length === 0 ? null : toMissingLine(cast.missing.map(nameOf)),
  };
};

export const useHeuteC = (eventId: string): HeuteCState => {
  const calendarEntryId = Number(eventId);
  const navigate = useNavigate();
  const live = useEveningLiveQuery(calendarEntryId);
  const move = useLiveMoveMutation(calendarEntryId);
  const marks = useCalledMarks(calendarEntryId);
  const nowMs = useNowMs();
  const [isAblaufOpen, setIsAblaufOpen] = useState(false);
  useScreenWakeLock();

  const lines = live.data?.lines ?? NO_LINES;
  const pointer = live.data?.live ?? null;
  const flow = liveFlowOf(lines, pointer);
  const canDirect = live.data?.canDirect ?? false;
  const forwardMove = forwardMoveOf(flow);
  const backMove = backMoveOf(lines, flow);
  const canForward = canDirect && forwardMove !== null && lines.length > 0 && !move.isPending;
  const canBack = canDirect && backMove !== null && !move.isPending;
  const forward = (): void => {
    if (canForward && forwardMove !== null) {
      move.mutate(forwardMove);
    }
  };
  const back = (): void => {
    if (canBack && backMove !== null) {
      move.mutate(backMove);
    }
  };
  useHeuteKeys(canDirect, forward, back);

  const eveningSeconds =
    pointer === null
      ? null
      : flow.state === 'ended'
        ? elapsedSecondsOf(pointer.startedAt, Date.parse(pointer.movedAt))
        : elapsedSecondsOf(pointer.startedAt, nowMs);
  const weiterKind = weiterKindOf(flow);
  const total = lines.length;
  const clock =
    live.data === undefined
      ? ''
      : toEveningClock(
          eveningSeconds === null ? null : elapsedTextOf(eveningSeconds),
          flow.state === 'ended',
        );

  return {
    isLoading: live.isPending,
    isFailed: live.isError,
    heading: toHeading(live.data?.title ?? null),
    clock,
    canDirect,
    now: actOf(flow.now, total),
    nowElapsed:
      flow.state === 'running' && pointer !== null
        ? elapsedTextOf(elapsedSecondsOf(pointer.movedAt, nowMs))
        : null,
    next: actOf(flow.next, total),
    afterName: flow.after?.name ?? (flow.next === null ? null : NOTHING_NEXT),
    stateTitle: STATE_TITLES[flow.state],
    stateText: flow.state === 'before' ? toOrderCount(total) : clock,
    isEmpty: total === 0,
    entries: ablaufOf(lines, flow).map((entry) => ({
      key: entry.appearanceId,
      text: toAblaufEntry(entry.number, entry.name),
      state: entry.state,
    })),
    currentIndex: flow.index,
    ablaufOpenText: toAblaufOpen(positionTextOf(flow, total), total),
    isAblaufOpen,
    openAblauf: () => {
      setIsAblaufOpen(true);
    },
    closeAblauf: () => {
      setIsAblaufOpen(false);
    },
    calls: peopleToCallOf(flow).map((call) => {
      const key = calledKeyOf(call.line.appearanceId, call.person.personId);

      return {
        key,
        name: nameOf(call.person),
        span: toCallSpan(call.line.position + 1),
        meta: toCallMeta(call.line.name, call.onStageNow),
        called: marks.isCalled(key),
        toggle: () => {
          marks.toggle(key);
        },
      };
    }),
    weiterKind,
    weiterCaption: toWeiterCaption(weiterKind),
    canForward,
    canBack,
    isMoving: move.isPending,
    isOverrun: isOverrunError(move.error),
    moveError: isOverrunError(move.error) ? null : toWriteErrorMessage(move.error),
    forward,
    back,
    close: () => {
      void navigate({ to: '/lab' });
    },
  };
};

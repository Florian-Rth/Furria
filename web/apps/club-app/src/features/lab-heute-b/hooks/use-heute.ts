import { apiStatusOf } from '@furria/api-client';
import type { UseQueryResult } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useScreenWakeLock } from '@/features/act-training/hooks/use-screen-wake-lock';
import { useEveningLiveQuery, useLiveMoveMutation } from '@/features/live/api';
import type { LiveFlow } from '@/features/live/live-flow';
import { backMoveOf, forwardMoveOf, liveFlowOf, peopleToCallOf } from '@/features/live/live-flow';
import type { EveningLiveResponse, LiveLine, LiveMoveBody } from '@/features/live/schemas';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  CONFLICT_MESSAGE,
  MOVE_FAILED,
  toAfterLine,
  toForwardCaption,
  toForwardHint,
} from '../heute-b-copy';
import type { CallGroup, StripChip } from '../heute-board';
import { callGroupsOf, keyActionOf, numberOf, stripChipsOf } from '../heute-board';

const CONFLICT_STATUS = 409;
const LAB_PATH = '/lab';

const EMPTY_FLOW: LiveFlow = { state: 'before', index: null, now: null, next: null, after: null };

export interface Heute {
  query: UseQueryResult<EveningLiveResponse, Error>;
  flow: LiveFlow;
  chips: StripChip[];
  stripFocusId: number | null;
  nowNumber: number;
  nextNumber: number;
  afterLine: string | null;
  actSince: string | null;
  eveningSince: string | null;
  calls: CallGroup[];
  total: number;
  canDirect: boolean;
  forwardCaption: string;
  forwardHint: string | null;
  canForward: boolean;
  canBack: boolean;
  moving: boolean;
  failure: string | null;
  forward: () => void;
  back: () => void;
  close: () => void;
}

const isControl = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && target.closest('button, a, input, textarea, select') !== null;

export const useHeute = (eventId: string): Heute => {
  const calendarEntryId = Number(eventId);
  const query = useEveningLiveQuery(calendarEntryId);
  const move = useLiveMoveMutation(calendarEntryId);
  const goBackTo = useGoBackTo();
  const [failure, setFailure] = useState<string | null>(null);
  useScreenWakeLock();

  const data = query.data;
  const lines = data?.lines ?? [];
  const flow = data === undefined ? EMPTY_FLOW : liveFlowOf(lines, data.live);
  const canDirect = data?.canDirect ?? false;
  const forwardBody = canDirect && lines.length > 0 ? forwardMoveOf(flow) : null;
  const backBody = canDirect ? backMoveOf(lines, flow) : null;
  const moving = move.isPending;
  const numberIn = (line: LiveLine | null): number => (line === null ? 0 : numberOf(lines, line));
  const running = flow.state === 'running';

  const send = (body: LiveMoveBody | null): void => {
    if (body === null || move.isPending) {
      return;
    }
    move.mutate(body, {
      onSuccess: () => {
        setFailure(null);
      },
      onError: (error) => {
        if (apiStatusOf(error) === CONFLICT_STATUS) {
          setFailure(CONFLICT_MESSAGE);
          void query.refetch();
          return;
        }
        setFailure(toWriteErrorMessage(error) ?? MOVE_FAILED);
      },
    });
  };
  const forward = (): void => {
    send(forwardBody);
  };
  const back = (): void => {
    send(backBody);
  };

  useEffect(() => {
    if (!canDirect) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      const action = keyActionOf(event.key, isControl(event.target));
      if (action === null || event.repeat) {
        return;
      }
      event.preventDefault();
      if (action === 'forward') {
        forward();
      } else {
        back();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  return {
    query,
    flow,
    chips: stripChipsOf(lines, flow),
    stripFocusId: flow.now?.appearanceId ?? flow.next?.appearanceId ?? null,
    nowNumber: numberIn(flow.now),
    nextNumber: numberIn(flow.next),
    afterLine: flow.after === null ? null : toAfterLine(numberIn(flow.after), flow.after.name),
    actSince: running ? (data?.live?.movedAt ?? null) : null,
    eveningSince: running ? (data?.live?.startedAt ?? null) : null,
    calls: callGroupsOf(lines, peopleToCallOf(flow)),
    total: lines.length,
    canDirect,
    forwardCaption: toForwardCaption(flow.state, flow.next !== null),
    forwardHint: toForwardHint(
      flow.state,
      flow.next === null ? null : numberIn(flow.next),
      flow.next?.name ?? null,
    ),
    canForward: forwardBody !== null && !moving,
    canBack: backBody !== null && !moving,
    moving,
    failure,
    forward,
    back,
    close: () => {
      void goBackTo({ href: LAB_PATH });
    },
  };
};

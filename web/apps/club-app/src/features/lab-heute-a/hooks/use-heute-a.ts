import type { KkHallGlyph } from '@furria/ui/KkHall';
import type { UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useScreenWakeLock } from '@/features/act-training/hooks/use-screen-wake-lock';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import { useEveningLiveQuery, useLiveMoveMutation } from '@/features/live/api';
import type { LiveFlow } from '@/features/live/live-flow';
import { backMoveOf, forwardMoveOf, liveFlowOf, peopleToCallOf } from '@/features/live/live-flow';
import type { EveningLiveResponse, LiveDirection, LiveMoveBody } from '@/features/live/schemas';
import { parsePositiveId } from '@/lib/positive-id';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  AFTER_LABEL,
  BEFORE_NAME,
  ENDED_NAME,
  MISSING_STATE,
  NEXT_LABEL,
  STANDS_IN_STATE,
  toCallHead,
  toForwardCaption,
  toHeuteLabel,
  toShortName,
  toStageCall,
} from '../heute-a-copy';
import type { CallGroup, ForwardKind, LineStrip } from '../heute-board';
import { callGroupsOf, forwardKindOf, keyIntentOf, stripOf } from '../heute-board';

export interface StripChip {
  key: string;
  name: string;
  state: 'off' | 'hint';
  icon: 'person' | 'add';
  stateLabel: string;
}

export interface CallChip {
  key: number;
  text: string;
  tone: 'gold' | 'neutral';
}

export interface CallRow {
  key: number;
  head: string;
  people: CallChip[];
}

export interface HeuteA {
  validId: boolean;
  query: UseQueryResult<EveningLiveResponse, Error>;
  title: string;
  label: string;
  canDirect: boolean;
  flow: LiveFlow;
  live: LiveDirection | null;
  actCount: number;
  stepName: string;
  forwardKind: ForwardKind;
  forwardCaption: string;
  forwardGlyph: KkHallGlyph;
  canForward: boolean;
  canBack: boolean;
  forward: () => void;
  back: () => void;
  failure: string | null;
  nowChips: StripChip[];
  nextChips: StripChip[];
  calls: CallRow[];
  close: () => void;
}

const NO_EVENING = 0;
const CALL_LABELS = [NEXT_LABEL, AFTER_LABEL] as const;

const chipsOf = ({ missing, standsIn }: LineStrip): StripChip[] => [
  ...missing.map((person) => ({
    key: `out:${person.personId}`,
    name: toShortName(person.firstName, person.lastName),
    state: 'off' as const,
    icon: 'person' as const,
    stateLabel: MISSING_STATE,
  })),
  ...standsIn.map((person) => ({
    key: `in:${person.personId}`,
    name: toShortName(person.firstName, person.lastName),
    state: 'hint' as const,
    icon: 'add' as const,
    stateLabel: STANDS_IN_STATE,
  })),
];

const callRowsOf = (groups: readonly CallGroup[]): CallRow[] =>
  groups.map((group, index) => ({
    key: group.line.appearanceId,
    head: toCallHead(CALL_LABELS[index] ?? AFTER_LABEL, group.line.name),
    people: group.people.map(({ person, onStageNow }) => {
      const name = toShortName(person.firstName, person.lastName);

      return {
        key: person.personId,
        text: onStageNow ? toStageCall(name) : name,
        tone: onStageNow ? ('gold' as const) : ('neutral' as const),
      };
    }),
  }));

const stepNameOf = (flow: LiveFlow): string => {
  if (flow.state === 'ended') {
    return ENDED_NAME;
  }

  return flow.now?.name ?? BEFORE_NAME;
};

const CONTROLS = 'button, a, input, select, textarea, [role="button"]';

const isOnControl = (target: EventTarget | null): boolean =>
  target instanceof Element && target.closest(CONTROLS) !== null;

export const useHeuteA = (rawEventId: string): HeuteA => {
  const eventId = parsePositiveId(rawEventId);
  const query = useEveningLiveQuery(eventId ?? NO_EVENING);
  const move = useLiveMoveMutation(eventId ?? NO_EVENING);
  const goBackTo = useGoBackTo();
  const data = query.data;
  const flow = liveFlowOf(data?.lines ?? [], data?.live ?? null);
  const canDirect = data?.canDirect ?? false;
  const forwardBody = forwardMoveOf(flow);
  const backBody = backMoveOf(data?.lines ?? [], flow);
  const forwardKind = forwardKindOf(flow);
  const hasLines = (data?.lines.length ?? 0) > 0;
  const canForward = canDirect && hasLines && forwardBody !== null && !move.isPending;
  const canBack = canDirect && backBody !== null && !move.isPending;

  const send = (body: LiveMoveBody | null): void => {
    if (body === null || !canDirect || move.isPending) {
      return;
    }
    move.mutate(body, {
      onError: () => {
        void query.refetch();
      },
    });
  };
  const forward = (): void => {
    if (canForward) {
      send(forwardBody);
    }
  };
  const back = (): void => {
    if (canBack) {
      send(backBody);
    }
  };

  useScreenWakeLock();

  useEffect(() => {
    if (!canDirect) {
      return;
    }
    const press = (event: KeyboardEvent): void => {
      const intent = keyIntentOf(event.key, isOnControl(event.target));
      if (intent === null || event.repeat) {
        return;
      }
      event.preventDefault();
      if (intent === 'forward') {
        forward();
      } else {
        back();
      }
    };
    window.addEventListener('keydown', press);

    return () => {
      window.removeEventListener('keydown', press);
    };
  }, [canDirect, forward, back]);

  return {
    validId: eventId !== null,
    query,
    title: data?.title ?? '',
    label: toHeuteLabel(data?.title ?? ''),
    canDirect,
    flow,
    live: data?.live ?? null,
    actCount: data?.lines.length ?? 0,
    stepName: stepNameOf(flow),
    forwardKind,
    forwardCaption: toForwardCaption(forwardKind),
    forwardGlyph: forwardKind === 'start' ? 'play' : 'next',
    canForward,
    canBack,
    forward,
    back,
    failure: toWriteErrorMessage(move.error),
    nowChips: chipsOf(stripOf(flow.now)),
    nextChips: chipsOf(stripOf(flow.next)),
    calls: callRowsOf(callGroupsOf(peopleToCallOf(flow))),
    close: () => {
      void goBackTo({ href: LAB_ORIGIN.to });
    },
  };
};

import type { LiveFlow, PersonToCall } from '@/features/live/live-flow';
import { elapsedSecondsOf } from '@/features/live/live-flow';
import type { LiveDirection, LiveLine, LivePerson } from '@/features/live/schemas';

export type ForwardKind = 'start' | 'next' | 'end' | 'over';

export type LiveKeyIntent = 'forward' | 'back' | null;

export interface LineStrip {
  missing: LivePerson[];
  standsIn: LivePerson[];
}

export interface CallGroup {
  line: LiveLine;
  people: PersonToCall[];
}

export interface Span {
  hours: number;
  minutes: number;
}

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

const FORWARD_KEYS: readonly string[] = ['ArrowRight', 'PageDown'];
const PRESS_KEYS: readonly string[] = [' ', 'Enter'];
const BACK_KEYS: readonly string[] = ['ArrowLeft', 'PageUp'];

export const forwardKindOf = (flow: LiveFlow): ForwardKind => {
  if (flow.state === 'ended') {
    return 'over';
  }
  if (flow.state === 'before') {
    return 'start';
  }

  return flow.next === null ? 'end' : 'next';
};

export const keyIntentOf = (key: string, onControl: boolean): LiveKeyIntent => {
  if (FORWARD_KEYS.includes(key) || (PRESS_KEYS.includes(key) && !onControl)) {
    return 'forward';
  }

  return BACK_KEYS.includes(key) ? 'back' : null;
};

const uniqueById = (people: readonly LivePerson[]): LivePerson[] =>
  people.filter(
    (person, index) => people.findIndex((other) => other.personId === person.personId) === index,
  );

export const stripOf = (line: LiveLine | null): LineStrip =>
  line === null
    ? { missing: [], standsIn: [] }
    : {
        missing: uniqueById([...line.cast.filter((person) => person.absent), ...line.missing]),
        standsIn: line.cast.filter((person) => person.standsIn && !person.absent),
      };

export const callGroupsOf = (calls: readonly PersonToCall[]): CallGroup[] =>
  calls.reduce<CallGroup[]>((groups, call) => {
    const group = groups.find(
      (candidate) => candidate.line.appearanceId === call.line.appearanceId,
    );

    if (group === undefined) {
      groups.push({ line: call.line, people: [call] });
    } else {
      group.people.push(call);
    }

    return groups;
  }, []);

export const minutesOf = (seconds: number): number => Math.floor(seconds / SECONDS_PER_MINUTE);

export const spanOf = (seconds: number): Span => {
  const minutes = minutesOf(seconds);

  return { hours: Math.floor(minutes / MINUTES_PER_HOUR), minutes: minutes % MINUTES_PER_HOUR };
};

export interface ClockReading {
  kind: LiveFlow['state'];
  count: number | null;
  eveningSeconds: number | null;
}

export const clockReadingOf = (
  flow: LiveFlow,
  live: LiveDirection | null,
  actCount: number,
  nowMs: number,
): ClockReading => {
  if (flow.state === 'ended' && live !== null) {
    const eveningSeconds = elapsedSecondsOf(live.startedAt, Date.parse(live.movedAt));

    return { kind: 'ended', count: minutesOf(eveningSeconds), eveningSeconds };
  }
  if (flow.state === 'running' && live !== null) {
    return {
      kind: 'running',
      count: minutesOf(elapsedSecondsOf(live.movedAt, nowMs)),
      eveningSeconds: elapsedSecondsOf(live.startedAt, nowMs),
    };
  }

  return { kind: 'before', count: actCount, eveningSeconds: null };
};

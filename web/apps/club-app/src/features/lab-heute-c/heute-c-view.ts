import { apiFailureOf } from '@furria/api-client';
import type { LiveFlow } from '@/features/live/live-flow';
import type { LiveLine, LivePerson } from '@/features/live/schemas';

export type AblaufState = 'done' | 'current' | 'open';

export interface AblaufEntry {
  appearanceId: number;
  number: number;
  name: string;
  state: AblaufState;
}

export interface LineCast {
  present: LivePerson[];
  standIns: LivePerson[];
  missing: LivePerson[];
}

export type WeiterKind = 'start' | 'next' | 'finish' | 'over';

export type KeyIntent = 'forward' | 'back';

const CONFLICT_STATUS = 409;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

const pad = (value: number): string => String(value).padStart(2, '0');

export const elapsedTextOf = (seconds: number): string => {
  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const rest = seconds % SECONDS_PER_MINUTE;

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
};

export const ablaufOf = (lines: readonly LiveLine[], flow: LiveFlow): AblaufEntry[] =>
  lines.map((line, index) => {
    const passed = flow.state === 'ended' || (flow.index !== null && index < flow.index);
    const state: AblaufState = index === flow.index ? 'current' : passed ? 'done' : 'open';

    return { appearanceId: line.appearanceId, number: index + 1, name: line.name, state };
  });

export const lineCastOf = (line: LiveLine): LineCast => {
  const onStage = line.cast.filter((person) => !person.absent);

  return {
    present: onStage.filter((person) => !person.standsIn),
    standIns: onStage.filter((person) => person.standsIn),
    missing: [
      ...line.cast.filter((person) => person.absent),
      ...line.missing.filter(
        (person) => !line.cast.some((member) => member.personId === person.personId),
      ),
    ],
  };
};

export const weiterKindOf = (flow: LiveFlow): WeiterKind => {
  if (flow.state === 'ended') {
    return 'over';
  }
  if (flow.state === 'before') {
    return 'start';
  }

  return flow.next === null ? 'finish' : 'next';
};

const FORWARD_KEYS = ['ArrowRight', 'PageDown'];
const PRESS_KEYS = [' ', 'Enter'];
const BACK_KEYS = ['ArrowLeft', 'PageUp'];

export const keyIntentOf = (key: string, onControl: boolean): KeyIntent | null => {
  if (FORWARD_KEYS.includes(key) || (PRESS_KEYS.includes(key) && !onControl)) {
    return 'forward';
  }

  return BACK_KEYS.includes(key) ? 'back' : null;
};

export const isOverrunError = (error: Error | null): boolean => {
  const failure = apiFailureOf(error);
  if (failure === null) {
    return false;
  }

  return (
    (failure.kind === 'refused' || failure.kind === 'status') && failure.status === CONFLICT_STATUS
  );
};

export const calledKeyOf = (appearanceId: number, personId: number): string =>
  `${appearanceId}:${personId}`;

export const positionTextOf = (flow: LiveFlow, total: number): string | null =>
  flow.index === null ? null : `${flow.index + 1} von ${total}`;

import type { LiveFlow, PersonToCall } from '@/features/live/live-flow';
import type { LiveLine, LivePerson } from '@/features/live/schemas';

export type StripChipState = 'done' | 'now' | 'next' | 'later';

export interface StripChip {
  appearanceId: number;
  number: number;
  name: string;
  state: StripChipState;
}

export interface CallGroup {
  line: LiveLine;
  number: number;
  people: PersonToCall[];
}

export type HeuteKeyAction = 'forward' | 'back';

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

const chipStateOf = (index: number, flow: LiveFlow): StripChipState => {
  if (flow.state === 'ended') {
    return 'done';
  }
  const current = flow.index ?? -1;
  if (index < current) {
    return 'done';
  }
  if (index === current) {
    return 'now';
  }

  return index === current + 1 ? 'next' : 'later';
};

export const stripChipsOf = (lines: readonly LiveLine[], flow: LiveFlow): StripChip[] =>
  lines.map((line, index) => ({
    appearanceId: line.appearanceId,
    number: index + 1,
    name: line.name,
    state: chipStateOf(index, flow),
  }));

export const numberOf = (lines: readonly LiveLine[], line: LiveLine): number =>
  lines.findIndex((candidate) => candidate.appearanceId === line.appearanceId) + 1;

export const callGroupsOf = (
  lines: readonly LiveLine[],
  calls: readonly PersonToCall[],
): CallGroup[] =>
  [...new Map(calls.map((call) => [call.line.appearanceId, call.line])).values()].map((line) => ({
    line,
    number: numberOf(lines, line),
    people: calls.filter((call) => call.line.appearanceId === line.appearanceId),
  }));

export const missingOf = (line: LiveLine): LivePerson[] => {
  const absent = line.cast.filter((person) => person.absent);

  return [
    ...line.missing,
    ...absent.filter(
      (person) => !line.missing.some((missing) => missing.personId === person.personId),
    ),
  ];
};

export const standInsOf = (line: LiveLine): LivePerson[] =>
  line.cast.filter((person) => person.standsIn && !person.absent);

const twoDigits = (value: number): string => String(value).padStart(2, '0');

export const elapsedTextOf = (seconds: number): string => {
  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const rest = seconds % SECONDS_PER_MINUTE;

  return hours > 0
    ? `${hours}:${twoDigits(minutes)}:${twoDigits(rest)}`
    : `${minutes}:${twoDigits(rest)}`;
};

const FORWARD_KEYS = new Set(['ArrowRight', ' ', 'Enter', 'PageDown']);
const BACK_KEYS = new Set(['ArrowLeft', 'PageUp']);
const NATIVE_KEYS = new Set([' ', 'Enter']);

export const keyActionOf = (key: string, onControl: boolean): HeuteKeyAction | null => {
  if (onControl && NATIVE_KEYS.has(key)) {
    return null;
  }
  if (FORWARD_KEYS.has(key)) {
    return 'forward';
  }

  return BACK_KEYS.has(key) ? 'back' : null;
};

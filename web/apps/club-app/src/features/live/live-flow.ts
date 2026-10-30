import type { LiveDirection, LiveLine, LiveMoveBody, LivePerson } from './schemas';

export const LIVE_FOLLOW_INTERVAL_MS = 4000;

export type LiveState = 'before' | 'running' | 'ended';

export interface LiveFlow {
  state: LiveState;
  index: number | null;
  now: LiveLine | null;
  next: LiveLine | null;
  after: LiveLine | null;
}

export interface PersonToCall {
  person: LivePerson;
  line: LiveLine;
  onStageNow: boolean;
}

const indexOnStage = (lines: readonly LiveLine[], live: LiveDirection | null): number | null => {
  if (live === null || live.appearanceId === null) {
    return null;
  }

  const index = lines.findIndex((line) => line.appearanceId === live.appearanceId);

  return index === -1 ? null : index;
};

const stateOf = (live: LiveDirection | null, index: number | null): LiveState => {
  if (index !== null) {
    return 'running';
  }

  return live !== null && live.appearanceId === null ? 'ended' : 'before';
};

export const liveFlowOf = (lines: readonly LiveLine[], live: LiveDirection | null): LiveFlow => {
  const index = indexOnStage(lines, live);
  const state = stateOf(live, index);
  const nextIndex = state === 'ended' ? lines.length : (index ?? -1) + 1;

  return {
    state,
    index,
    now: index === null ? null : (lines[index] ?? null),
    next: lines[nextIndex] ?? null,
    after: lines[nextIndex + 1] ?? null,
  };
};

const appearanceIdOf = (line: LiveLine | null): number | null =>
  line === null ? null : line.appearanceId;

export const forwardMoveOf = (flow: LiveFlow): LiveMoveBody | null =>
  flow.state === 'ended' ? null : { from: appearanceIdOf(flow.now), to: appearanceIdOf(flow.next) };

export const backMoveOf = (lines: readonly LiveLine[], flow: LiveFlow): LiveMoveBody | null => {
  if (flow.state !== 'running' || flow.index === null || flow.index === 0) {
    return null;
  }

  return { from: appearanceIdOf(flow.now), to: appearanceIdOf(lines[flow.index - 1] ?? null) };
};

export const peopleToCallOf = (flow: LiveFlow): PersonToCall[] => {
  const onStage = new Set((flow.now?.cast ?? []).map((person) => person.personId));
  const called = new Set<number>();

  return [flow.next, flow.after].flatMap((line) =>
    line === null
      ? []
      : line.cast
          .filter((person) => !person.absent && !called.has(person.personId))
          .map((person) => {
            called.add(person.personId);

            return { person, line, onStageNow: onStage.has(person.personId) };
          }),
  );
};

export const elapsedSecondsOf = (since: string, nowMs: number): number =>
  Math.max(0, Math.floor((nowMs - Date.parse(since)) / 1000));

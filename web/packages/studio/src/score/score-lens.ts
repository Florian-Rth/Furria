import type { TimelineRange } from '@furria/studio/music-timeline';
import { WHOLE_LABEL } from '@furria/studio/score-copy';
import type { TimelinePart } from '@furria/studio/Timeline';
import type { KkScoreLens } from '@furria/ui/KkScoreTransport';

export const WHOLE_LENS = 'all';

interface ScoreLensChoice {
  lens: string;
  focus: TimelineRange | null;
}

export const scoreLensesOf = (parts: readonly TimelinePart[]): KkScoreLens[] => [
  { id: WHOLE_LENS, label: WHOLE_LABEL },
  ...parts
    .filter((part) => part.range !== null)
    .map((part) => ({ id: String(part.key), label: part.label })),
];

export const scoreLensOf = (parts: readonly TimelinePart[], picked: string): ScoreLensChoice => {
  const range = parts.find((candidate) => String(candidate.key) === picked)?.range ?? null;

  return range === null ? { lens: WHOLE_LENS, focus: null } : { lens: picked, focus: range };
};

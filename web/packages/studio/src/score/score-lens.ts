import type { TimelineRange } from '@furria/studio/music-timeline';
import { WHOLE_LABEL } from '@furria/studio/score-copy';
import type { ScorePart } from '@furria/studio/score-steps';
import type { KkScoreLens } from '@furria/ui/KkScoreTransport';

export const WHOLE_LENS = 'all';

interface ScoreLensChoice {
  lens: string;
  focus: TimelineRange | null;
}

export const scoreLensesOf = (parts: readonly ScorePart[]): KkScoreLens[] => [
  { id: WHOLE_LENS, label: WHOLE_LABEL },
  ...parts
    .filter((part) => part.range !== null)
    .map((part) => ({ id: String(part.partId), label: part.name })),
];

export const scoreLensOf = (parts: readonly ScorePart[], picked: string): ScoreLensChoice => {
  const range = parts.find((candidate) => String(candidate.partId) === picked)?.range ?? null;

  return range === null ? { lens: WHOLE_LENS, focus: null } : { lens: picked, focus: range };
};

import { placedLinesOf, unplacedLinesOf } from '@/features/running-order/running-order-ops';
import type { CastPerson, LineKey } from '@/features/running-order/schemas';
import type { DraftLine, FindingTally, RunningOrderDraft } from '@/features/running-order/types';

export type PersonGapState = 'conflict' | 'hint' | 'fine';

export interface PersonStop {
  key: LineKey;
  index: number;
}

export interface PersonGap {
  between: number;
  state: PersonGapState;
}

export interface PersonTimeline {
  person: CastPerson;
  absent: boolean;
  stops: PersonStop[];
  gaps: PersonGap[];
  waiting: LineKey[];
  tally: FindingTally;
}

const NO_ROOM = 0;
const TIGHT_ROOM = 1;

export const gapStateOf = (between: number): PersonGapState => {
  if (between <= NO_ROOM) {
    return 'conflict';
  }

  return between === TIGHT_ROOM ? 'hint' : 'fine';
};

const castEntryOf = (line: DraftLine, personId: number): CastPerson | null =>
  line.act.cast.find((person) => person.personId === personId) ?? null;

export const personTimelineOf = (
  draft: RunningOrderDraft,
  personId: number,
): PersonTimeline | null => {
  const entries = draft.lines.flatMap((line) => {
    const entry = castEntryOf(line, personId);

    return entry === null ? [] : [entry];
  });
  const [person] = entries;

  if (person === undefined) {
    return null;
  }

  const absent = entries.some((entry) => entry.absent);
  const stops = placedLinesOf(draft).flatMap((line, index) =>
    castEntryOf(line, personId) === null ? [] : [{ key: line.key, index }],
  );
  const gaps = absent
    ? []
    : stops.slice(1).map((stop, at) => {
        const between = stop.index - (stops[at]?.index ?? stop.index) - 1;

        return { between, state: gapStateOf(between) };
      });

  return {
    person,
    absent,
    stops,
    gaps,
    waiting: unplacedLinesOf(draft)
      .filter((line) => castEntryOf(line, personId) !== null)
      .map((line) => line.key),
    tally: {
      conflicts: gaps.filter((gap) => gap.state === 'conflict').length,
      hints: gaps.filter((gap) => gap.state === 'hint').length,
    },
  };
};

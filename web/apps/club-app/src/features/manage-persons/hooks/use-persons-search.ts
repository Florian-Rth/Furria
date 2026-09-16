import type { KkFilterOption, KkLetterIndexEntry, KkLetterPace } from '@furria/ui';
import { useState } from 'react';
import { useSearchQuery } from '@/features/session';
import type { MembershipState } from '@/lib/api/schemas';
import { scrollElementIntoView } from '@/lib/scroll-to';
import { ALL_STATES_FILTER_ID, toStateFilterOptions } from '@/lib/state-chips';
import { useLetterPosition } from '@/lib/use-letter-position';
import { toLetterAnchorId, toLetterAnchors } from '../letter-anchors';
import type { PersonLetterSection } from '../person-filters';
import {
  availablePersonLetters,
  countPersonsByState,
  filterPersons,
  groupPersonsByLetter,
} from '../person-filters';
import type { PersonSummary } from '../schemas';

export interface PersonsSearch {
  query: string;
  state: string;
  selectState: (id: string) => void;
  letter: string | undefined;
  jumpTo: (letter: string, pace: KkLetterPace) => void;
  sections: PersonLetterSection[];
  visibleCount: number;
  totals: Record<MembershipState, number>;
  filterOptions: KkFilterOption[];
  letters: KkLetterIndexEntry[];
}

export const usePersonsSearch = (persons: readonly PersonSummary[]): PersonsSearch => {
  const query = useSearchQuery();
  const [state, setState] = useState<string>(ALL_STATES_FILTER_ID);

  const searched = filterPersons(persons, { query, state: ALL_STATES_FILTER_ID });
  const visible = filterPersons(persons, { query, state });
  const sections = groupPersonsByLetter(visible);
  const position = useLetterPosition(toLetterAnchors(sections));

  const jumpTo = (target: string, pace: KkLetterPace): void => {
    position.markLetter(target);
    scrollElementIntoView(document.getElementById(toLetterAnchorId(target)), 'start', pace);
  };

  return {
    query,
    state,
    selectState: setState,
    letter: position.letter,
    jumpTo,
    sections,
    visibleCount: visible.length,
    totals: countPersonsByState(persons),
    filterOptions: toStateFilterOptions(countPersonsByState(searched)),
    letters: availablePersonLetters(visible),
  };
};

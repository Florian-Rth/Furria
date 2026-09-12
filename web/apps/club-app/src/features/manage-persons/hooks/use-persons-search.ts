import type { KkFilterOption, KkLetterIndexEntry } from '@furria/ui';
import { useState } from 'react';
import type { MembershipState } from '@/lib/api/schemas';
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
  setQuery: (value: string) => void;
  state: string;
  selectState: (id: string) => void;
  letter: string | undefined;
  jumpTo: (letter: string) => void;
  sections: PersonLetterSection[];
  visibleCount: number;
  total: number;
  totals: Record<MembershipState, number>;
  filterOptions: KkFilterOption[];
  letters: KkLetterIndexEntry[];
}

export const usePersonsSearch = (persons: readonly PersonSummary[]): PersonsSearch => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<string>(ALL_STATES_FILTER_ID);

  const searched = filterPersons(persons, { query, state: ALL_STATES_FILTER_ID });
  const visible = filterPersons(persons, { query, state });
  const sections = groupPersonsByLetter(visible);
  const position = useLetterPosition(toLetterAnchors(sections));

  const jumpTo = (target: string): void => {
    position.markLetter(target);
    document
      .getElementById(toLetterAnchorId(target))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return {
    query,
    setQuery,
    state,
    selectState: setState,
    letter: position.letter,
    jumpTo,
    sections,
    visibleCount: visible.length,
    total: persons.length,
    totals: countPersonsByState(persons),
    filterOptions: toStateFilterOptions(countPersonsByState(searched)),
    letters: availablePersonLetters(visible),
  };
};

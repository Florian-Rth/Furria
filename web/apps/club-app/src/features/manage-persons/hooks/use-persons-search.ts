import type { KkFilterOption, KkLetterIndexEntry } from '@furria/ui';
import { useState } from 'react';
import type { MembershipState } from '@/lib/api/schemas';
import { ALL_STATES_FILTER_ID, toStateFilterOptions } from '@/lib/state-chips';
import { toLetterAnchorId } from '../letter-anchors';
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
  const [letter, setLetter] = useState<string | undefined>(undefined);

  const searched = filterPersons(persons, { query, state: ALL_STATES_FILTER_ID });
  const visible = filterPersons(persons, { query, state });

  const jumpTo = (target: string): void => {
    setLetter(target);
    document
      .getElementById(toLetterAnchorId(target))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return {
    query,
    setQuery,
    state,
    selectState: setState,
    letter,
    jumpTo,
    sections: groupPersonsByLetter(visible),
    visibleCount: visible.length,
    total: persons.length,
    totals: countPersonsByState(persons),
    filterOptions: toStateFilterOptions(countPersonsByState(searched)),
    letters: availablePersonLetters(visible),
  };
};

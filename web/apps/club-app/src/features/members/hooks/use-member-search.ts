import type { KkFilterOption, KkLetterIndexEntry } from '@furria/ui';
import { useState } from 'react';
import type { MembershipState } from '@/lib/api/schemas';
import { scrollElementIntoView } from '@/lib/scroll-to';
import { ALL_STATES_FILTER_ID, toStateFilterOptions } from '@/lib/state-chips';
import { useLetterPosition } from '@/lib/use-letter-position';
import type { MemberLetterSection } from '../member-filters';
import { availableLetters, countByState, filterMembers, groupByLetter } from '../member-filters';
import { toLetterAnchorId, toLetterAnchors } from '../members-labels';
import type { MemberSummary } from '../schemas';

export interface MemberSearch {
  query: string;
  setQuery: (value: string) => void;
  state: string;
  selectState: (id: string) => void;
  letter: string | undefined;
  jumpTo: (letter: string) => void;
  sections: MemberLetterSection[];
  visibleCount: number;
  totals: Record<MembershipState, number>;
  filterOptions: KkFilterOption[];
  letters: KkLetterIndexEntry[];
}

export const useMemberSearch = (members: readonly MemberSummary[]): MemberSearch => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<string>(ALL_STATES_FILTER_ID);

  const searched = filterMembers(members, { query, state: ALL_STATES_FILTER_ID });
  const visible = filterMembers(members, { query, state });
  const sections = groupByLetter(visible);
  const position = useLetterPosition(toLetterAnchors(sections));

  const jumpTo = (target: string): void => {
    position.markLetter(target);
    scrollElementIntoView(document.getElementById(toLetterAnchorId(target)), 'start');
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
    totals: countByState(members),
    filterOptions: toStateFilterOptions(countByState(searched)),
    letters: availableLetters(visible),
  };
};

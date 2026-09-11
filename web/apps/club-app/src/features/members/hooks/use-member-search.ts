import type { KkFilterOption, KkLetterIndexEntry } from '@furria/ui';
import { useState } from 'react';
import type { MembershipState } from '@/lib/api/schemas';
import { ALL_STATES_FILTER_ID, toStateFilterOptions } from '@/lib/state-chips';
import type { MemberLetterSection } from '../member-filters';
import { availableLetters, countByState, filterMembers, groupByLetter } from '../member-filters';
import { toLetterAnchorId } from '../members-labels';
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
  total: number;
  totals: Record<MembershipState, number>;
  filterOptions: KkFilterOption[];
  letters: KkLetterIndexEntry[];
}

export const useMemberSearch = (members: readonly MemberSummary[]): MemberSearch => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<string>(ALL_STATES_FILTER_ID);
  const [letter, setLetter] = useState<string | undefined>(undefined);

  const searched = filterMembers(members, { query, state: ALL_STATES_FILTER_ID });
  const visible = filterMembers(members, { query, state });

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
    sections: groupByLetter(visible),
    visibleCount: visible.length,
    total: members.length,
    totals: countByState(members),
    filterOptions: toStateFilterOptions(countByState(searched)),
    letters: availableLetters(visible),
  };
};

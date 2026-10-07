import type { KkFilterOption, KkLetterIndexEntry, KkLetterPace } from '@furria/ui';
import { useState } from 'react';
import { useSearchQuery } from '@/features/session';
import type { MembershipState } from '@/lib/api/schemas';
import { scrollElementIntoView } from '@/lib/scroll-to';
import { ALL_STATES_FILTER_ID } from '@/lib/state-chips';
import { useLetterPosition } from '@/lib/use-letter-position';
import { toLetterAnchorId, toLetterAnchors } from '../letter-anchors';
import type { PersonLetterSection } from '../person-filters';
import {
  ARCHIVED_PERSONS_FILTER_ID,
  availablePersonLetters,
  countPersonsByState,
  filterPersons,
  groupPersonsByLetter,
  toPersonFilterOptions,
} from '../person-filters';
import type { PersonSummary } from '../schemas';
import { usePersonsArchivedView } from './use-persons-archived-view';

export interface PersonsSearch {
  query: string;
  state: string;
  filter: string;
  selectFilter: (id: string) => void;
  isArchivedView: boolean;
  letter: string | undefined;
  jumpTo: (letter: string, pace: KkLetterPace) => void;
  sections: PersonLetterSection[];
  visibleCount: number;
  isRegisterEmpty: boolean;
  totals: Record<MembershipState, number>;
  filterOptions: KkFilterOption[];
  letters: KkLetterIndexEntry[];
}

export const usePersonsSearch = (
  listed: readonly PersonSummary[],
  archived: readonly PersonSummary[],
): PersonsSearch => {
  const query = useSearchQuery();
  const archivedView = usePersonsArchivedView();
  const [state, setState] = useState<string>(ALL_STATES_FILTER_ID);
  const isArchivedView = archivedView.isArchived;

  const searched = filterPersons(listed, { query, state: ALL_STATES_FILTER_ID });
  const searchedArchived = filterPersons(archived, { query, state: ALL_STATES_FILTER_ID });
  const visible = isArchivedView ? searchedArchived : filterPersons(listed, { query, state });
  const sections = groupPersonsByLetter(visible);
  const position = useLetterPosition(toLetterAnchors(sections));

  const jumpTo = (target: string, pace: KkLetterPace): void => {
    position.markLetter(target);
    scrollElementIntoView(document.getElementById(toLetterAnchorId(target)), 'start', pace);
  };

  const selectFilter = (id: string): void => {
    if (id === ARCHIVED_PERSONS_FILTER_ID) {
      archivedView.show(true);

      return;
    }

    setState(id);

    if (isArchivedView) {
      archivedView.show(false);
    }
  };

  return {
    query,
    state,
    filter: isArchivedView ? ARCHIVED_PERSONS_FILTER_ID : state,
    selectFilter,
    isArchivedView,
    letter: position.letter,
    jumpTo,
    sections,
    visibleCount: visible.length,
    isRegisterEmpty: listed.length === 0 && archived.length === 0,
    totals: countPersonsByState(listed),
    filterOptions: toPersonFilterOptions(
      countPersonsByState(searched),
      { total: archived.length, matching: searchedArchived.length },
      isArchivedView,
    ),
    letters: availablePersonLetters(visible),
  };
};

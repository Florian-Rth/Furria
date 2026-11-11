import { useState } from 'react';
import { useChoosablePeopleQuery } from '../api';
import type { CalendarParticipantPool } from '../calendar-authoring';
import { toCappedList } from '../calendar-names';
import type { CalendarGroupShortcut, CalendarPersonName } from '../calendar-people';
import {
  toChosenPeople,
  toChosenWithGroup,
  toChosenWithoutPerson,
  toChosenWithPerson,
  toGroupShortcuts,
  toPersonMatches,
} from '../calendar-people';
import type { AudiencePerson, ChoosablePerson } from '../schemas';
import type { CalendarEntryEditorControl } from './use-calendar-entry-editor';

const NO_PEOPLE: readonly ChoosablePerson[] = [];
const CHOSEN_LIMIT = 8;

const toAllChosenLabel = (hidden: number): string => `+${hidden} weitere`;

export interface CalendarPeoplePickerControl {
  query: string;
  setQuery: (value: string) => void;
  chosen: readonly CalendarPersonName[];
  hiddenChosenLabel: string | undefined;
  showAllChosen: () => void;
  matches: readonly ChoosablePerson[];
  shortcuts: readonly CalendarGroupShortcut[];
  isLoading: boolean;
  failed: boolean;
  isRetrying: boolean;
  retry: () => void;
  choose: (personId: number) => void;
  unchoose: (personId: number) => void;
  addGroup: (groupId: string) => void;
}

export const useCalendarPeoplePicker = (
  control: CalendarEntryEditorControl,
  held: readonly AudiencePerson[],
  clubGroups: CalendarParticipantPool,
): CalendarPeoplePickerControl => {
  const [query, setQuery] = useState('');
  const [isChosenExpanded, setIsChosenExpanded] = useState(false);
  const peopleQuery = useChoosablePeopleQuery();
  const people = peopleQuery.data?.people ?? NO_PEOPLE;
  const chosenIds = control.values.audiencePersonIds;
  const groups = clubGroups.state === 'ready' ? clubGroups.groups : [];
  const shortcuts = toGroupShortcuts(groups, people, chosenIds);
  const chosen = toCappedList(
    toChosenPeople(chosenIds, people, held),
    CHOSEN_LIMIT,
    isChosenExpanded,
  );

  return {
    query,
    setQuery,
    chosen: chosen.shown,
    hiddenChosenLabel: chosen.hidden === 0 ? undefined : toAllChosenLabel(chosen.hidden),
    showAllChosen: () => {
      setIsChosenExpanded(true);
    },
    matches: toPersonMatches(people, query, chosenIds),
    shortcuts,
    isLoading: peopleQuery.isPending,
    failed: peopleQuery.isError,
    isRetrying: peopleQuery.isFetching,
    retry: () => {
      void peopleQuery.refetch();
    },
    choose: (personId) => {
      control.setAudiencePeople(toChosenWithPerson(chosenIds, personId));
      setQuery('');
    },
    unchoose: (personId) => {
      control.setAudiencePeople(toChosenWithoutPerson(chosenIds, personId));
    },
    addGroup: (groupId) => {
      const shortcut = shortcuts.find((candidate) => String(candidate.groupId) === groupId);

      if (shortcut !== undefined) {
        control.setAudiencePeople(toChosenWithGroup(chosenIds, shortcut));
      }
    },
  };
};

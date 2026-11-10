import { KkMeta } from '@furria/ui/KkMeta';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkSearchField } from '@furria/ui/KkSearchField';
import { KkSelectField } from '@furria/ui/KkSelectField';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { CalendarParticipantPool } from '../calendar-authoring';
import { toGroupShortcutOptions, toNoMatchLabel } from '../calendar-labels';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import { useCalendarPeoplePicker } from '../hooks/use-calendar-people-picker';
import type { AudiencePerson } from '../schemas';
import { CalendarChosenPersonChip } from './CalendarChosenPersonChip';
import { CalendarPersonMatchRow } from './CalendarPersonMatchRow';

const SEARCH_NAME = 'audience-person-search';
const SEARCH_LABEL = 'Person hinzufügen';
const SEARCH_PLACEHOLDER = 'Vorname oder Nachname';
const CLEAR_LABEL = 'Suche leeren';
const GROUP_LABEL = 'Ganze Gruppe hinzufügen';
const GROUP_PLACEHOLDER = 'Gruppe wählen';
const LOADING_LABEL = 'Personen werden geladen …';
const FAILED_MESSAGE = 'Die Personen konnten nicht geladen werden.';
const NO_GROUP_CHOSEN = '';

interface CalendarPeoplePickerProps {
  control: CalendarEntryEditorControl;
  held: readonly AudiencePerson[];
  clubGroups: CalendarParticipantPool;
  errorText: string | undefined;
}

export const CalendarPeoplePicker: FC<CalendarPeoplePickerProps> = ({
  control,
  held,
  clubGroups,
  errorText,
}) => {
  const picker = useCalendarPeoplePicker(control, held, clubGroups);
  const groupOptions = toGroupShortcutOptions(picker.shortcuts);
  const noMatchLabel = toNoMatchLabel(picker.query, picker.matches.length, picker.isLoading);

  const chosenChips = picker.chosen.map((person) => (
    <CalendarChosenPersonChip key={person.personId} person={person} onRemove={picker.unchoose} />
  ));
  const chosenList =
    chosenChips.length === 0 ? null : (
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, minWidth: 0 }}>
        {chosenChips}
      </Stack>
    );

  const matchRows = picker.matches.map((person) => (
    <CalendarPersonMatchRow key={person.personId} person={person} onChoose={picker.choose} />
  ));
  const matchList = matchRows.length === 0 ? null : <KkPanel variant="list">{matchRows}</KkPanel>;
  const noMatch = noMatchLabel === null ? null : <KkMeta>{noMatchLabel}</KkMeta>;
  const loading = picker.isLoading && !picker.failed ? <KkMeta>{LOADING_LABEL}</KkMeta> : null;
  const failure = picker.failed ? (
    <KkRetryAlert message={FAILED_MESSAGE} retrying={picker.isRetrying} onRetry={picker.retry} />
  ) : null;
  const error =
    errorText === undefined ? null : (
      <KkNote tone="warning" icon="alert">
        {errorText}
      </KkNote>
    );

  const groupField =
    groupOptions.length === 0 ? null : (
      <KkSelectField
        name="audience-whole-group"
        label={GROUP_LABEL}
        value={NO_GROUP_CHOSEN}
        options={groupOptions}
        onChange={picker.addGroup}
        placeholder={GROUP_PLACEHOLDER}
        presentation="select"
      />
    );

  return (
    <Stack sx={{ gap: 1.25, minWidth: 0 }}>
      {chosenList}
      {error}
      <KkSearchField
        name={SEARCH_NAME}
        label={SEARCH_LABEL}
        clearLabel={CLEAR_LABEL}
        value={picker.query}
        onChange={picker.setQuery}
        placeholder={SEARCH_PLACEHOLDER}
      />
      {loading}
      {failure}
      {matchList}
      {noMatch}
      {groupField}
    </Stack>
  );
};

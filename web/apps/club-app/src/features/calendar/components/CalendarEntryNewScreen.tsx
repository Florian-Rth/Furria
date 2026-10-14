import type { FC } from 'react';
import { toCalendarErrorMessage } from '../calendar-messages';
import { useCalendarAuthoring } from '../hooks/use-calendar-authoring';
import { useCalendarEntrySupplies } from '../hooks/use-calendar-entry-supplies';
import { CalendarEntryDenied } from './CalendarEntryDenied';
import { CalendarEntryEditor } from './CalendarEntryEditor';
import { CalendarEntryEditorSkeleton } from './CalendarEntryEditorSkeleton';
import { CalendarEntryError } from './CalendarEntryError';

const TITLE = 'Termin hinzufügen';
const DENIED_MESSAGE = 'Dir fehlt die Berechtigung, Termine anzulegen.';

export const CalendarEntryNewScreen: FC = () => {
  const authoringLoad = useCalendarAuthoring();
  const suppliesLoad = useCalendarEntrySupplies();
  const { authoring } = authoringLoad;
  const { supplies } = suppliesLoad;
  const errorMessage = toCalendarErrorMessage(authoringLoad.error ?? suppliesLoad.error);
  const isRetrying = authoringLoad.isRetrying || suppliesLoad.isRetrying;

  const reload = (): void => {
    authoringLoad.retry();
    suppliesLoad.retry();
  };

  if (authoring !== null && !authoring.mayAuthor) {
    return <CalendarEntryDenied title={TITLE} message={DENIED_MESSAGE} />;
  }
  if (authoring !== null && supplies !== null) {
    return (
      <CalendarEntryEditor
        entry={null}
        ownerOptions={authoring.ownerOptions}
        clubGroups={supplies.clubGroups}
        clubGroupsReload={supplies.clubGroupsReload}
        venues={supplies.venues}
      />
    );
  }
  if (errorMessage !== null) {
    return <CalendarEntryError message={errorMessage} isRetrying={isRetrying} onRetry={reload} />;
  }

  return <CalendarEntryEditorSkeleton title={TITLE} />;
};

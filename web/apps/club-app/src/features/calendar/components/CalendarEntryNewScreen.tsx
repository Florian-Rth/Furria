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
  const { authoring, error: authoringError, retry: retryAuthoring } = useCalendarAuthoring();
  const { supplies, error: suppliesError, retry: retrySupplies } = useCalendarEntrySupplies();
  const errorMessage = toCalendarErrorMessage(authoringError ?? suppliesError);

  const reload = (): void => {
    retryAuthoring();
    retrySupplies();
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
        venues={supplies.venues}
      />
    );
  }
  if (errorMessage !== null) {
    return <CalendarEntryError message={errorMessage} onRetry={reload} />;
  }

  return <CalendarEntryEditorSkeleton title={TITLE} />;
};

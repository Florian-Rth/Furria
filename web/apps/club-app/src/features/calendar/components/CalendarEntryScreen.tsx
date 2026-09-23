import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { useCalendarQuery } from '../api';
import { findCalendarEntry, toCalendarEntryIdParam } from '../calendar-authoring';
import { toCalendarErrorMessage } from '../calendar-messages';
import { ALL_CALENDAR_ENTRIES_QUERY } from '../calendar-query';
import { useCalendarAuthoring } from '../hooks/use-calendar-authoring';
import { useCalendarEntrySupplies } from '../hooks/use-calendar-entry-supplies';
import { CalendarEntryDenied } from './CalendarEntryDenied';
import { CalendarEntryEditor } from './CalendarEntryEditor';
import { CalendarEntryEditorSkeleton } from './CalendarEntryEditorSkeleton';
import { CalendarEntryError } from './CalendarEntryError';
import { CalendarEntryNotFound } from './CalendarEntryNotFound';

const ROUTE_ID = '/_app/calendar_/$calendarEntryId';
const TITLE = 'Termin ändern';
const DENIED_MESSAGE = 'Nur der Eigentümer kann diesen Termin bearbeiten.';

export const CalendarEntryScreen: FC = () => {
  const { calendarEntryId } = useParams({ from: ROUTE_ID });
  const id = toCalendarEntryIdParam(calendarEntryId);
  const entries = useCalendarQuery(ALL_CALENDAR_ENTRIES_QUERY);
  const { authoring, error: authoringError, retry: retryAuthoring } = useCalendarAuthoring();
  const { supplies, error: suppliesError, retry: retrySupplies } = useCalendarEntrySupplies();
  const errorMessage = toCalendarErrorMessage(entries.error ?? authoringError ?? suppliesError);

  const reload = (): void => {
    if (entries.isError) {
      void entries.refetch();
    }
    retryAuthoring();
    retrySupplies();
  };

  if (entries.data === undefined || authoring === null || supplies === null) {
    if (errorMessage !== null) {
      return <CalendarEntryError message={errorMessage} onRetry={reload} />;
    }

    return <CalendarEntryEditorSkeleton title={TITLE} />;
  }

  const entry = findCalendarEntry(entries.data.entries, id);

  if (entry === null) {
    return <CalendarEntryNotFound />;
  }
  if (!authoring.mayOwn(entry)) {
    return <CalendarEntryDenied title={TITLE} message={DENIED_MESSAGE} />;
  }

  return (
    <CalendarEntryEditor
      entry={entry}
      ownerOptions={authoring.ownerOptions}
      clubGroups={supplies.clubGroups}
      venues={supplies.venues}
    />
  );
};

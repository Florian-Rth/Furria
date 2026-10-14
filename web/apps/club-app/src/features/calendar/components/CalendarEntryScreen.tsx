import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { isNotFoundError } from '@/lib/query-error';
import { useCalendarEntryQuery } from '../api';
import { toCalendarErrorMessage } from '../calendar-messages';
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
  const id = parsePositiveId(calendarEntryId);
  const entryQuery = useCalendarEntryQuery(id);
  const authoringLoad = useCalendarAuthoring();
  const suppliesLoad = useCalendarEntrySupplies();
  const { authoring } = authoringLoad;
  const { supplies } = suppliesLoad;
  const entry = entryQuery.data?.entry;
  const isMissing = id === null || isNotFoundError(entryQuery.error);
  const errorMessage = toCalendarErrorMessage(
    entryQuery.error ?? authoringLoad.error ?? suppliesLoad.error,
  );
  const isRetrying = entryQuery.isFetching || authoringLoad.isRetrying || suppliesLoad.isRetrying;

  const reload = (): void => {
    if (entryQuery.isError) {
      void entryQuery.refetch();
    }
    authoringLoad.retry();
    suppliesLoad.retry();
  };

  if (isMissing) {
    return <CalendarEntryNotFound />;
  }
  if (entry === undefined || authoring === null || supplies === null) {
    if (errorMessage !== null) {
      return <CalendarEntryError message={errorMessage} isRetrying={isRetrying} onRetry={reload} />;
    }

    return <CalendarEntryEditorSkeleton title={TITLE} />;
  }
  if (!authoring.mayOwn(entry)) {
    return <CalendarEntryDenied title={TITLE} message={DENIED_MESSAGE} />;
  }

  return (
    <CalendarEntryEditor
      entry={entry}
      ownerOptions={authoring.ownerOptions}
      clubGroups={supplies.clubGroups}
      clubGroupsReload={supplies.clubGroupsReload}
      venues={supplies.venues}
    />
  );
};

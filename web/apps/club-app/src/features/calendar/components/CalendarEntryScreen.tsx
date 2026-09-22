import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { useCalendarQuery } from '../api';
import { findCalendarEntry, toCalendarEntryIdParam } from '../calendar-authoring';
import { ALL_CALENDAR_ENTRIES_QUERY } from '../calendar-query';
import { useCalendarAuthoring } from '../hooks/use-calendar-authoring';
import { CalendarEntryDenied } from './CalendarEntryDenied';
import { CalendarEntryEditor } from './CalendarEntryEditor';
import { CalendarEntryEditorSkeleton } from './CalendarEntryEditorSkeleton';
import { CalendarEntryNotFound } from './CalendarEntryNotFound';

const ROUTE_ID = '/_app/calendar_/$calendarEntryId';
const TITLE = 'Termin ändern';
const DENIED_MESSAGE = 'Nur der Eigentümer eines Termins darf ihn ändern.';

export const CalendarEntryScreen: FC = () => {
  const { calendarEntryId } = useParams({ from: ROUTE_ID });
  const id = toCalendarEntryIdParam(calendarEntryId);
  const authoring = useCalendarAuthoring();
  const entries = useCalendarQuery(ALL_CALENDAR_ENTRIES_QUERY);

  if (entries.data === undefined) {
    return entries.isLoading ? <CalendarEntryEditorSkeleton /> : <CalendarEntryNotFound />;
  }
  if (authoring.isLoading) {
    return <CalendarEntryEditorSkeleton />;
  }

  const entry = id === null ? null : findCalendarEntry(entries.data.entries, id);

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
      clubGroups={authoring.clubGroups}
      venues={authoring.venues}
    />
  );
};

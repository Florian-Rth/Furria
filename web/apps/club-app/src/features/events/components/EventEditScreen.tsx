import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { useRunningVenuesQuery } from '@/features/calendar';
import { EVENTS_ORIGIN, usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { isNotFoundError } from '@/lib/query-error';
import { useEventQuery } from '../api';
import { toEventId } from '../events-labels';
import { toEventErrorMessage } from '../events-messages';
import { EventEditor } from './EventEditor';
import { EventEditorDenied } from './EventEditorDenied';
import { EventEditorError } from './EventEditorError';
import { EventEditorNotFound } from './EventEditorNotFound';
import { EventEditorSkeleton } from './EventEditorSkeleton';

const ROUTE_ID = '/_app/events_/$eventId_/edit';
const TITLE = 'Veranstaltung bearbeiten';

export const EventEditScreen: FC = () => {
  const { eventId } = useParams({ from: ROUTE_ID });
  const id = toEventId(eventId);
  const permissions = usePermissions();
  const event = useEventQuery(id);
  const venues = useRunningVenuesQuery();
  const errorMessage = toEventErrorMessage(event.error ?? venues.error);

  const reload = (): void => {
    if (event.isError) {
      void event.refetch();
    }
    if (venues.isError) {
      void venues.refetch();
    }
  };

  if (!permissions.isUndecided && !permissions.has(PERMISSION_KEYS.eventsManage)) {
    return <EventEditorDenied title={TITLE} origin={EVENTS_ORIGIN} />;
  }
  if (id === null || isNotFoundError(event.error)) {
    return <EventEditorNotFound />;
  }
  if (event.data !== undefined && venues.data !== undefined) {
    return <EventEditor event={event.data} venues={venues.data.venues} />;
  }
  if (errorMessage !== null) {
    return <EventEditorError title={TITLE} message={errorMessage} onRetry={reload} />;
  }

  return <EventEditorSkeleton title={TITLE} />;
};

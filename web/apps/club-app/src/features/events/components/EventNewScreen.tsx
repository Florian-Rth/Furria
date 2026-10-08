import type { FC } from 'react';
import { useRunningVenuesQuery } from '@/features/calendar';
import { EVENTS_ORIGIN, usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toEventErrorMessage } from '../events-messages';
import { EventEditor } from './EventEditor';
import { EventEditorDenied } from './EventEditorDenied';
import { EventEditorError } from './EventEditorError';
import { EventEditorSkeleton } from './EventEditorSkeleton';

const TITLE = 'Veranstaltung anlegen';

export const EventNewScreen: FC = () => {
  const permissions = usePermissions();
  const venues = useRunningVenuesQuery();
  const errorMessage = toEventErrorMessage(venues.error);

  const reload = (): void => {
    void venues.refetch();
  };

  if (!permissions.isUndecided && !permissions.has(PERMISSION_KEYS.eventsManage)) {
    return <EventEditorDenied title={TITLE} origin={EVENTS_ORIGIN} />;
  }
  if (venues.data !== undefined) {
    return <EventEditor event={null} venues={venues.data.venues} />;
  }
  if (errorMessage !== null) {
    return <EventEditorError title={TITLE} message={errorMessage} onRetry={reload} />;
  }

  return <EventEditorSkeleton title={TITLE} />;
};

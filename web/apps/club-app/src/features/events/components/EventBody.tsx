import type { FC } from 'react';
import { AccessDenied, deniedMessageOf } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useEventQuery } from '../api';
import { toEventErrorMessage } from '../events-messages';
import { EventError } from './EventError';
import { EventNotFound } from './EventNotFound';
import { EventSkeleton } from './EventSkeleton';
import { EventView } from './EventView';

interface EventBodyProps {
  eventId: number | null;
}

export const EventBody: FC<EventBodyProps> = ({ eventId }) => {
  const event = useEventQuery(eventId);
  const errorMessage = toEventErrorMessage(event.error);
  const missing = eventId === null || isNotFoundError(event.error);

  const reload = (): void => {
    void event.refetch();
  };

  if (event.data !== undefined) {
    return <EventView event={event.data} />;
  }
  if (isForbiddenError(event.error)) {
    return <AccessDenied message={deniedMessageOf(PERMISSION_KEYS.eventsManage)} />;
  }
  if (missing) {
    return <EventNotFound />;
  }
  if (errorMessage !== null) {
    return <EventError message={errorMessage} onRetry={reload} />;
  }

  return <EventSkeleton />;
};

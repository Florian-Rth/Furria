import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied, deniedMessageOf } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useEventQuery } from '../api';
import { toEventErrorMessage } from '../events-messages';
import { EventCancellationLine } from './EventCancellationLine';
import { EventDeletionLine } from './EventDeletionLine';
import { EventError } from './EventError';
import { EventNotFound } from './EventNotFound';
import { EventPicturePanel } from './EventPicturePanel';
import { EventSkeleton } from './EventSkeleton';

interface EventManageBodyProps {
  eventId: number | null;
}

export const EventManageBody: FC<EventManageBodyProps> = ({ eventId }) => {
  const event = useEventQuery(eventId);
  const errorMessage = toEventErrorMessage(event.error);
  const missing = eventId === null || isNotFoundError(event.error);

  const reload = (): void => {
    void event.refetch();
  };

  if (event.data !== undefined) {
    return (
      <KkPanelStack>
        <EventPicturePanel event={event.data} />
        <EventCancellationLine event={event.data} />
        <EventDeletionLine event={event.data} />
      </KkPanelStack>
    );
  }
  if (isForbiddenError(event.error)) {
    return <AccessDenied message={deniedMessageOf(PERMISSION_KEYS.eventsManage)} />;
  }
  if (missing) {
    return <EventNotFound />;
  }
  if (errorMessage !== null) {
    return <EventError message={errorMessage} isRetrying={event.isFetching} onRetry={reload} />;
  }

  return <EventSkeleton />;
};

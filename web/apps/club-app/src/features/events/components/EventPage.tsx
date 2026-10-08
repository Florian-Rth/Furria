import { KkScreen, KkScreenHeaderSkeleton } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  AREA_HANDOVERS,
  EVENTS_KEYS,
  EVENTS_ORIGIN,
  RequireAnyPermission,
} from '@/features/session';
import { useEventQuery } from '../api';
import { toEventId } from '../events-labels';
import { EventBody } from './EventBody';
import { EventHeader } from './EventHeader';

const EVENT_ROUTE_ID = '/_app/events_/$eventId';

export const EventPage: FC = () => {
  const { eventId } = useParams({ from: EVENT_ROUTE_ID });
  const id = toEventId(eventId);
  const event = useEventQuery(id);
  const hasFailed = id === null || event.error !== null;
  const title = event.data?.title ?? EVENTS_ORIGIN.label;

  const pendingHeader = hasFailed ? null : <KkScreenHeaderSkeleton />;
  const header = event.data === undefined ? pendingHeader : <EventHeader event={event.data} />;

  return (
    <KkScreen
      kind="working"
      title={title}
      origin={EVENTS_ORIGIN}
      header={header}
      handover={AREA_HANDOVERS.events}
    >
      <RequireAnyPermission permissionKeys={EVENTS_KEYS}>
        <EventBody eventId={id} />
      </RequireAnyPermission>
    </KkScreen>
  );
};

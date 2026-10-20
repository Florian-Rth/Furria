import type { KkScreenOrigin } from '@furria/ui';
import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { EVENTS_KEYS, RequireAnyPermission } from '@/features/session';
import { parsePositiveId } from '@/lib/positive-id';
import { useEventQuery } from '../api';
import { EVENT_FALLBACK_TITLE } from '../event-board-copy';
import { EVENT_MANAGE_TITLE } from '../events-labels';
import { EventManageBody } from './EventManageBody';

interface EventManagePageProps {
  eventId: string;
}

export const EventManagePage: FC<EventManagePageProps> = ({ eventId }) => {
  const id = parsePositiveId(eventId);
  const event = useEventQuery(id);
  const origin: KkScreenOrigin = {
    label: event.data?.title ?? EVENT_FALLBACK_TITLE,
    to: '/events/$eventId',
    params: { eventId },
  };

  return (
    <KkScreen kind="detail" title={EVENT_MANAGE_TITLE} origin={origin}>
      <RequireAnyPermission permissionKeys={EVENTS_KEYS}>
        <EventManageBody eventId={id} />
      </RequireAnyPermission>
    </KkScreen>
  );
};

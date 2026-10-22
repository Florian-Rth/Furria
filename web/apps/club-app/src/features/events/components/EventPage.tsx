import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { EVENTS_KEYS, EVENTS_ORIGIN } from '@/features/session/app-sections';
import { RequireAnyPermission } from '@/features/session/components/RequireAnyPermission';
import { EVENT_FALLBACK_TITLE } from '../event-board-copy';
import { useEventPage } from '../hooks/use-event-page';
import { EventBody } from './EventBody';

interface EventPageProps {
  eventId: string;
}

export const EventPage: FC<EventPageProps> = ({ eventId }) => {
  const page = useEventPage(eventId);
  const title = page.query.data?.title ?? EVENT_FALLBACK_TITLE;

  return (
    <KkScreen kind="detail" title={title} origin={EVENTS_ORIGIN}>
      <RequireAnyPermission permissionKeys={EVENTS_KEYS}>
        <EventBody page={page} />
      </RequireAnyPermission>
    </KkScreen>
  );
};

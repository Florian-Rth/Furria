import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenActions } from '@furria/ui/screen-declaration';
import { useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';
import { EVENTS_TITLE, MORE_SECTION } from '@/features/session/app-sections';
import { NEW_EVENT_ACTION_LABEL } from '../event-board-copy';
import { EventsBody } from './EventsBody';

export const EventsPage: FC = () => {
  const navigate = useNavigate();
  const actions: KkScreenActions = [
    {
      id: 'new-event',
      label: NEW_EVENT_ACTION_LABEL,
      icon: 'add',
      onSelect: () => {
        void navigate({ to: '/events/new' });
      },
    },
  ];

  return (
    <KkScreen kind="overview" section={MORE_SECTION} title={EVENTS_TITLE} actions={actions}>
      <EventsBody />
    </KkScreen>
  );
};

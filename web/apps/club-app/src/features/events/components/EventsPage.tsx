import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenActions } from '@furria/ui/screen-declaration';
import { useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';
import { EVENTS_TITLE, MORE_SECTION } from '@/features/session/app-sections';
import { ACTS_ACTION_LABEL, NEW_EVENT_ACTION_LABEL } from '../event-board-copy';
import { useEventsWorkbench } from '../hooks/use-events-workbench';
import { EventsBody } from './EventsBody';

export const EventsPage: FC = () => {
  const navigate = useNavigate();
  const { plansRunningOrder } = useEventsWorkbench();
  const newEvent = {
    id: 'new-event',
    label: NEW_EVENT_ACTION_LABEL,
    icon: 'add',
    onSelect: () => {
      void navigate({ to: '/events/new' });
    },
  } as const;
  const acts = {
    id: 'acts',
    label: ACTS_ACTION_LABEL,
    icon: 'stage',
    onSelect: () => {
      void navigate({ to: '/acts' });
    },
  } as const;
  const actions: KkScreenActions = plansRunningOrder ? [acts, newEvent] : [newEvent];

  return (
    <KkScreen kind="overview" section={MORE_SECTION} title={EVENTS_TITLE} actions={actions}>
      <EventsBody />
    </KkScreen>
  );
};

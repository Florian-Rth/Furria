import { KkButton } from '@furria/ui/KkButton';
import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { EVENTS_PATH } from '@/features/session/app-sections';
import { EVENT_NOT_FOUND } from '../events-labels';

const BACK_LABEL = 'Zu den Veranstaltungen';

export const EventNotFound: FC = () => (
  <KkEmptyState
    title={EVENT_NOT_FOUND.title}
    description={EVENT_NOT_FOUND.description}
    action={
      <KkButton variant="outlined" component={Link} to={EVENTS_PATH}>
        {BACK_LABEL}
      </KkButton>
    }
  />
);

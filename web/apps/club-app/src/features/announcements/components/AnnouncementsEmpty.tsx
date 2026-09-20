import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';
import { NO_ANNOUNCEMENTS_LINE, NO_ANNOUNCEMENTS_TITLE } from '../announcements-labels';

export const AnnouncementsEmpty: FC = () => (
  <KkEmptyState title={NO_ANNOUNCEMENTS_TITLE} description={NO_ANNOUNCEMENTS_LINE} />
);

import { KkEmptyState, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { ANNOUNCEMENTS_ORIGIN, ANNOUNCEMENTS_TITLE } from '../announcements-labels';

const NOT_FOUND_TITLE = 'NICHT MEHR DA';
const NOT_FOUND_DESCRIPTION = 'Diesen Aushang gibt es nicht mehr.';

export const AnnouncementNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={ANNOUNCEMENTS_TITLE} origin={ANNOUNCEMENTS_ORIGIN}>
    <KkEmptyState title={NOT_FOUND_TITLE} description={NOT_FOUND_DESCRIPTION} />
  </KkScreen>
);

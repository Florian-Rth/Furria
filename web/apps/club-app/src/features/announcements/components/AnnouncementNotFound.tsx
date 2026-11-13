import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import {
  type AnnouncementScreenKind,
  toAnnouncementScreenFrame,
} from '../announcement-screen-kind';
import { ANNOUNCEMENTS_TITLE } from '../announcements-labels';

const NOT_FOUND_TITLE = 'NICHT MEHR DA';
const NOT_FOUND_DESCRIPTION = 'Diesen Aushang gibt es nicht mehr.';

interface AnnouncementNotFoundProps {
  kind: AnnouncementScreenKind;
}

export const AnnouncementNotFound: FC<AnnouncementNotFoundProps> = ({ kind }) => {
  const frame = toAnnouncementScreenFrame(kind, ANNOUNCEMENTS_TITLE);

  return (
    <KkScreen {...frame}>
      <KkEmptyState title={NOT_FOUND_TITLE} description={NOT_FOUND_DESCRIPTION} />
    </KkScreen>
  );
};

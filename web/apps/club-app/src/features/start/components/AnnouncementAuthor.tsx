import { KkStartTile } from '@furria/ui/KkStartTile';
import type { FC } from 'react';
import type { AnnouncementByline } from '../hooks/use-announcements-tile';

interface AnnouncementAuthorProps {
  byline: AnnouncementByline | null;
}

export const AnnouncementAuthor: FC<AnnouncementAuthorProps> = ({ byline }) => {
  if (byline === null) {
    return null;
  }

  return (
    <KkStartTile.Author
      name={byline.name}
      initials={byline.initials}
      image={byline.portrait}
      office={byline.office}
    />
  );
};

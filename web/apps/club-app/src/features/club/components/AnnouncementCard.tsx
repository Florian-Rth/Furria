import { KkChip } from '@furria/ui/KkChip';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AnnouncementAuthorLine } from '@/features/announcements/components/AnnouncementAuthorLine';
import { ANNOUNCEMENT_NEW_LABEL } from '@/lib/announcements';
import type { ClubAnnouncement } from '../schemas';

interface AnnouncementCardProps {
  announcement: ClubAnnouncement;
  isNew: boolean;
}

export const AnnouncementCard: FC<AnnouncementCardProps> = ({ announcement, isNew }) => {
  const newChip = isNew ? <KkChip tone="gold">{ANNOUNCEMENT_NEW_LABEL}</KkChip> : null;

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <Stack
        direction="row"
        sx={{ gap: 1, alignItems: 'flex-start', justifyContent: 'space-between', minWidth: 0 }}
      >
        <KkHeading level={4} component="h3">
          {announcement.title}
        </KkHeading>
        {newChip}
      </Stack>
      <KkText variant="body2" measure="lead" sx={{ whiteSpace: 'pre-line' }}>
        {announcement.body}
      </KkText>
      <AnnouncementAuthorLine author={announcement.author} publishedAt={announcement.publishedAt} />
    </Stack>
  );
};

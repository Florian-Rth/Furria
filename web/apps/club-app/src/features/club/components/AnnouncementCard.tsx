import { KkChip, KkHeading, KkMeta, KkPhoto, KkText } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  ANNOUNCEMENT_NEW_LABEL,
  ANNOUNCEMENT_PORTRAIT_LABEL,
  formatPublishedDay,
} from '@/lib/announcements';
import type { ClubAnnouncement } from '../schemas';

const PORTRAIT_SPACING = 9;

interface AnnouncementCardProps {
  announcement: ClubAnnouncement;
  isNew: boolean;
}

export const AnnouncementCard: FC<AnnouncementCardProps> = ({ announcement, isNew }) => {
  const { author } = announcement;
  const authorName = `${author.firstName} ${author.lastName}`;

  const newChip = isNew ? <KkChip tone="gold">{ANNOUNCEMENT_NEW_LABEL}</KkChip> : null;
  const officeLine =
    author.officeName === null ? null : <KkMeta tone="accent">{author.officeName}</KkMeta>;

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <Stack
        direction="row"
        sx={{ gap: 1, alignItems: 'flex-start', justifyContent: 'space-between', minWidth: 0 }}
      >
        <KkHeading level={5} component="h3">
          {announcement.title}
        </KkHeading>
        {newChip}
      </Stack>
      <KkText variant="body2" sx={{ whiteSpace: 'pre-line' }}>
        {announcement.body}
      </KkText>
      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', minWidth: 0 }}>
        <Box sx={(theme) => ({ width: theme.spacing(PORTRAIT_SPACING), flexShrink: 0 })}>
          <KkPhoto
            alt={authorName}
            orientation="portrait"
            placeholderLabel={ANNOUNCEMENT_PORTRAIT_LABEL}
            source={author.portraitUrl ?? undefined}
          />
        </Box>
        <Stack sx={{ gap: 0.25, minWidth: 0 }}>
          <KkText variant="subtitle2">{authorName}</KkText>
          {officeLine}
          <KkMeta>{formatPublishedDay(announcement.publishedAt)}</KkMeta>
        </Stack>
      </Stack>
    </Stack>
  );
};

import { KkMeta, KkPhoto, KkText } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { formatPublishedDay } from '@/lib/announcements';
import { toInitials } from '@/lib/initials';
import type { AnnouncementAuthor } from '../schemas';

const PORTRAIT_SPACING = 9;

interface AnnouncementAuthorLineProps {
  author: AnnouncementAuthor;
  publishedAt: string;
  children?: ReactNode;
}

export const AnnouncementAuthorLine: FC<AnnouncementAuthorLineProps> = ({
  author,
  publishedAt,
  children,
}) => {
  const authorName = `${author.firstName} ${author.lastName}`;
  const initials = toInitials(author.firstName, author.lastName);
  const officeLine =
    author.officeName === null ? null : <KkMeta tone="accent">{author.officeName}</KkMeta>;

  return (
    <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', minWidth: 0 }}>
      <Box sx={(theme) => ({ width: theme.spacing(PORTRAIT_SPACING), flexShrink: 0 })}>
        <KkPhoto
          alt={authorName}
          orientation="portrait"
          placeholderLabel={initials}
          source={author.portraitUrl ?? undefined}
        />
      </Box>
      <Stack sx={{ gap: 0.25, minWidth: 0 }}>
        <KkText variant="subtitle2">{authorName}</KkText>
        {officeLine}
        <KkMeta>{formatPublishedDay(publishedAt)}</KkMeta>
        {children}
      </Stack>
    </Stack>
  );
};

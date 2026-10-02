import { KkHeading, KkMeta, KkRule, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AnnouncementAuthorLine } from '@/features/announcements';
import { useScrollIntoView } from '../hooks/use-scroll-into-view';
import type { StartAnnouncement } from '../schemas';
import { toValidUntilLine } from '../start-lines';

const PRE_LINE = { whiteSpace: 'pre-line' } as const;

interface AnnouncementBlockProps {
  announcement: StartAnnouncement;
  focused: boolean;
  ruled: boolean;
}

export const AnnouncementBlock: FC<AnnouncementBlockProps> = ({ announcement, focused, ruled }) => {
  const scrollTarget = useScrollIntoView(focused);
  const validUntil = toValidUntilLine(announcement.validUntil);
  const validity = validUntil === null ? null : <KkMeta>{validUntil}</KkMeta>;
  const rule = ruled ? <KkRule weight="hair" /> : null;

  return (
    <Stack component="article" ref={scrollTarget} sx={{ gap: 1.5, minWidth: 0 }}>
      {rule}
      <KkHeading level={4} component="h3">
        {announcement.title}
      </KkHeading>
      <AnnouncementAuthorLine author={announcement.author} publishedAt={announcement.publishedAt}>
        {validity}
      </AnnouncementAuthorLine>
      <KkText variant="body2" measure="lead" sx={PRE_LINE}>
        {announcement.body}
      </KkText>
    </Stack>
  );
};

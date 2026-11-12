import { KkChip } from '@furria/ui/KkChip';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanel } from '@furria/ui/KkPanel';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ANNOUNCEMENT_EXPIRED_LABEL, toValidUntilLabel } from '../announcements-labels';
import type { Announcement } from '../schemas';
import { AnnouncementAddOns } from './AnnouncementAddOns';
import { AnnouncementAuthorLine } from './AnnouncementAuthorLine';
import { AnnouncementText } from './AnnouncementText';

interface AnnouncementReadingBodyProps {
  announcement: Announcement;
  isExpired: boolean;
}

export const AnnouncementReadingBody: FC<AnnouncementReadingBodyProps> = ({
  announcement,
  isExpired,
}) => {
  const validUntilLabel = toValidUntilLabel(announcement.validUntil);
  const validUntilLine =
    validUntilLabel === null ? null : <KkMeta tone="faint">{validUntilLabel}</KkMeta>;
  const expiredChip = isExpired ? (
    <KkChip tone="neutral">{ANNOUNCEMENT_EXPIRED_LABEL}</KkChip>
  ) : null;

  return (
    <KkPanel variant="block">
      <Stack sx={{ gap: 2, minWidth: 0 }}>
        <Stack
          direction="row"
          sx={{ gap: 1, alignItems: 'flex-start', justifyContent: 'space-between', minWidth: 0 }}
        >
          <KkHeading level={2} component="h1">
            {announcement.title}
          </KkHeading>
          {expiredChip}
        </Stack>
        <AnnouncementText body={announcement.body} mentions={announcement.mentions} />
        <AnnouncementAddOns announcement={announcement} />
        <AnnouncementAuthorLine author={announcement.author} publishedAt={announcement.publishedAt}>
          {validUntilLine}
        </AnnouncementAuthorLine>
      </Stack>
    </KkPanel>
  );
};

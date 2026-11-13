import { KkBulletin } from '@furria/ui/KkBulletin';
import { KkChip } from '@furria/ui/KkChip';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkPanel } from '@furria/ui/KkPanel';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toAnnouncementAddOnMarks } from '../announcement-add-ons';
import { ANNOUNCEMENT_EXPIRED_LABEL, toAnnouncementMetaLabel } from '../announcements-labels';
import { useAnswerJump } from '../hooks/use-answer-jump';
import type { Announcement } from '../schemas';
import { AnnouncementAddOns } from './AnnouncementAddOns';
import { AnnouncementAnswerLines } from './AnnouncementAnswerLines';
import { AnnouncementText } from './AnnouncementText';

interface AnnouncementReadingBodyProps {
  announcement: Announcement;
  isExpired: boolean;
}

export const AnnouncementReadingBody: FC<AnnouncementReadingBodyProps> = ({
  announcement,
  isExpired,
}) => {
  const jumpToAnswer = useAnswerJump(announcement.announcementId);
  const meta = toAnnouncementMetaLabel(
    announcement.publishedAt,
    announcement.validUntil,
    announcement.author,
  );
  const marks = toAnnouncementAddOnMarks(announcement);
  const expiredChip = isExpired ? (
    <KkChip tone="neutral">{ANNOUNCEMENT_EXPIRED_LABEL}</KkChip>
  ) : null;

  return (
    <KkPanel variant="block">
      <Stack sx={{ gap: 2, minWidth: 0 }}>
        <KkBulletin.Head>
          <Stack sx={{ minWidth: 0, flex: 1, gap: 0.5 }}>
            <KkHeading level={2} component="h1">
              {announcement.title}
            </KkHeading>
            <KkBulletin.Meta>{meta}</KkBulletin.Meta>
          </Stack>
          {expiredChip}
        </KkBulletin.Head>
        <AnnouncementText body={announcement.body} mentions={announcement.mentions} />
        <AnnouncementAnswerLines marks={marks} onSelect={jumpToAnswer} />
        <AnnouncementAddOns announcement={announcement} />
      </Stack>
    </KkPanel>
  );
};

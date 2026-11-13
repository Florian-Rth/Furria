import { KkBulletin } from '@furria/ui/KkBulletin';
import { KkSheet } from '@furria/ui/KkSheet';
import type { KkSheetAction } from '@furria/ui/sheet-actions';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toPeekId } from '@/lib/peek';
import { usePeek } from '@/lib/use-peek';
import { toAnnouncementAddOnMarks } from '../announcement-add-ons';
import { ANNOUNCEMENT_EDIT_ROUTE } from '../announcement-routes';
import { ANNOUNCEMENT_EDIT_ACTION_LABEL, toAnnouncementMetaLabel } from '../announcements-labels';
import { useAnswerJump } from '../hooks/use-answer-jump';
import type { Announcement } from '../schemas';
import { AnnouncementAddOns } from './AnnouncementAddOns';
import { AnnouncementAnswerLines } from './AnnouncementAnswerLines';
import { AnnouncementText } from './AnnouncementText';

const CLOSE_LABEL = 'Aushang schließen';

const toAnnouncementId = (announcement: Announcement): number => announcement.announcementId;

interface AnnouncementSheetProps {
  announcements: readonly Announcement[];
}

export const AnnouncementSheet: FC<AnnouncementSheetProps> = ({ announcements }) => {
  const announcement = usePeek('announcement', announcements, toAnnouncementId);
  const jumpToAnswer = useAnswerJump(announcement?.announcementId ?? 0);

  if (announcement === null) {
    return null;
  }

  const sheetId = toPeekId('announcement', announcement.announcementId);
  const meta = toAnnouncementMetaLabel(
    announcement.publishedAt,
    announcement.validUntil,
    announcement.author,
  );
  const marks = toAnnouncementAddOnMarks(announcement);
  const editAction: KkSheetAction | undefined = announcement.viewerMayEdit
    ? {
        label: ANNOUNCEMENT_EDIT_ACTION_LABEL,
        component: Link,
        to: ANNOUNCEMENT_EDIT_ROUTE,
        params: { announcementId: String(announcement.announcementId) },
      }
    : undefined;

  return (
    <KkSheet id={sheetId} title={announcement.title} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          <KkBulletin.Meta>{meta}</KkBulletin.Meta>
          <AnnouncementText body={announcement.body} mentions={announcement.mentions} />
          <AnnouncementAnswerLines marks={marks} onSelect={jumpToAnswer} />
          <AnnouncementAddOns announcement={announcement} />
        </Stack>
      </KkSheet.Body>
      <KkSheet.Actions secondary={editAction} />
    </KkSheet>
  );
};

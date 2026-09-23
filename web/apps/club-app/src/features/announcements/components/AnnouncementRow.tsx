import { KkChip, KkHeading, KkMeta, KkPanel, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { ANNOUNCEMENT_NEW_LABEL } from '@/lib/announcements';
import { ANNOUNCEMENT_EXPIRED_LABEL, toValidUntilLabel } from '../announcements-labels';
import type { Announcement } from '../schemas';
import { AnnouncementAuthorLine } from './AnnouncementAuthorLine';

const LANDING_KIND = 'announcement';

interface AnnouncementRowProps {
  announcement: Announcement;
  isNew: boolean;
  isExpired: boolean;
  highlightedKey: string | null;
}

export const AnnouncementRow: FC<AnnouncementRowProps> = ({
  announcement,
  isNew,
  isExpired,
  highlightedKey,
}) => {
  const validUntilLabel = toValidUntilLabel(announcement.validUntil);

  const newChip = isNew ? <KkChip tone="gold">{ANNOUNCEMENT_NEW_LABEL}</KkChip> : null;
  const expiredChip = isExpired ? (
    <KkChip tone="neutral">{ANNOUNCEMENT_EXPIRED_LABEL}</KkChip>
  ) : null;
  const validUntilLine =
    validUntilLabel === null ? null : <KkMeta tone="faint">{validUntilLabel}</KkMeta>;
  const landingKey = toLandingKey(LANDING_KIND, announcement.announcementId);

  return (
    <KkPanel
      variant="block"
      highlight={announcement.viewerMayEdit && highlightedKey === landingKey}
      landing={announcement.viewerMayEdit ? landingKey : undefined}
      component={announcement.viewerMayEdit ? Link : undefined}
      to={announcement.viewerMayEdit ? '/announcements/$announcementId' : undefined}
      params={
        announcement.viewerMayEdit
          ? { announcementId: String(announcement.announcementId) }
          : undefined
      }
    >
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        <Stack
          direction="row"
          sx={{ gap: 1, alignItems: 'flex-start', justifyContent: 'space-between', minWidth: 0 }}
        >
          <KkHeading level={4} component="h3">
            {announcement.title}
          </KkHeading>
          <Stack direction="row" sx={{ gap: 0.75, flexShrink: 0 }}>
            {newChip}
            {expiredChip}
          </Stack>
        </Stack>
        <KkText variant="body2" measure="lead" sx={{ whiteSpace: 'pre-line' }}>
          {announcement.body}
        </KkText>
        <AnnouncementAuthorLine author={announcement.author} publishedAt={announcement.publishedAt}>
          {validUntilLine}
        </AnnouncementAuthorLine>
      </Stack>
    </KkPanel>
  );
};

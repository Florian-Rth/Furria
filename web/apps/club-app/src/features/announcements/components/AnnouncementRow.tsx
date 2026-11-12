import { KkChip } from '@furria/ui/KkChip';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanel } from '@furria/ui/KkPanel';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write/landing-target';
import { ANNOUNCEMENT_NEW_LABEL } from '@/lib/announcements';
import {
  ANNOUNCEMENT_EDIT_ACTION_LABEL,
  ANNOUNCEMENT_EXPIRED_LABEL,
  toValidUntilLabel,
} from '../announcements-labels';
import type { Announcement } from '../schemas';
import { AnnouncementAuthorLine } from './AnnouncementAuthorLine';
import { AnnouncementText } from './AnnouncementText';

const LANDING_KIND = 'announcement';
const EDIT_ROUTE = '/announcements/$announcementId';

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
  const isHighlighted = announcement.viewerMayEdit && highlightedKey === landingKey;
  const landing = announcement.viewerMayEdit ? landingKey : undefined;
  const editParams = { announcementId: String(announcement.announcementId) };
  const editAction = announcement.viewerMayEdit ? (
    <KkIconButton
      label={ANNOUNCEMENT_EDIT_ACTION_LABEL}
      icon="edit"
      size="small"
      component={Link}
      to={EDIT_ROUTE}
      params={editParams}
    />
  ) : null;

  return (
    <KkPanel variant="block" highlight={isHighlighted} landing={landing}>
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        <Stack
          direction="row"
          sx={{ gap: 1, alignItems: 'flex-start', justifyContent: 'space-between', minWidth: 0 }}
        >
          <KkHeading level={4} component="h3">
            {announcement.title}
          </KkHeading>
          <Stack direction="row" sx={{ gap: 0.75, flexShrink: 0, alignItems: 'center' }}>
            {newChip}
            {expiredChip}
            {editAction}
          </Stack>
        </Stack>
        <AnnouncementText body={announcement.body} mentions={announcement.mentions} />
        <AnnouncementAuthorLine author={announcement.author} publishedAt={announcement.publishedAt}>
          {validUntilLine}
        </AnnouncementAuthorLine>
      </Stack>
    </KkPanel>
  );
};

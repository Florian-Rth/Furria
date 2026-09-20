import { KkButton, KkChip, KkHeading, KkIcon, KkMeta, KkPanel, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ANNOUNCEMENT_NEW_LABEL } from '@/lib/announcements';
import {
  ANNOUNCEMENT_EXPIRED_LABEL,
  EDIT_ANNOUNCEMENT_LABEL,
  toValidUntilLabel,
  WITHDRAW_ANNOUNCEMENT_LABEL,
} from '../announcements-labels';
import type { Announcement } from '../schemas';
import { AnnouncementAuthorLine } from './AnnouncementAuthorLine';

interface AnnouncementRowProps {
  announcement: Announcement;
  isNew: boolean;
  isExpired: boolean;
  onEdit: () => void;
  onWithdraw: () => void;
}

export const AnnouncementRow: FC<AnnouncementRowProps> = ({
  announcement,
  isNew,
  isExpired,
  onEdit,
  onWithdraw,
}) => {
  const validUntilLabel = toValidUntilLabel(announcement.validUntil);

  const newChip = isNew ? <KkChip tone="gold">{ANNOUNCEMENT_NEW_LABEL}</KkChip> : null;
  const expiredChip = isExpired ? (
    <KkChip tone="neutral">{ANNOUNCEMENT_EXPIRED_LABEL}</KkChip>
  ) : null;
  const validUntilLine =
    validUntilLabel === null ? null : <KkMeta tone="faint">{validUntilLabel}</KkMeta>;

  const actions = announcement.viewerMayEdit ? (
    <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
      <KkButton
        size="small"
        variant="outlined"
        startIcon={<KkIcon name="edit" size="small" />}
        onClick={onEdit}
      >
        {EDIT_ANNOUNCEMENT_LABEL}
      </KkButton>
      <KkButton size="small" variant="text" tone="danger" onClick={onWithdraw}>
        {WITHDRAW_ANNOUNCEMENT_LABEL}
      </KkButton>
    </Stack>
  ) : null;

  return (
    <KkPanel variant="block">
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        <Stack
          direction="row"
          sx={{ gap: 1, alignItems: 'flex-start', justifyContent: 'space-between', minWidth: 0 }}
        >
          <KkHeading level={5} component="h3">
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
        {actions}
      </Stack>
    </KkPanel>
  );
};

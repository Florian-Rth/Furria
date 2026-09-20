import { KkButton, KkChip, KkHeading, KkIcon, KkMeta, KkPanel, KkPhoto, KkText } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  ANNOUNCEMENT_NEW_LABEL,
  ANNOUNCEMENT_PORTRAIT_LABEL,
  formatPublishedDay,
} from '@/lib/announcements';
import {
  ANNOUNCEMENT_EXPIRED_LABEL,
  EDIT_ANNOUNCEMENT_LABEL,
  toValidUntilLabel,
  WITHDRAW_ANNOUNCEMENT_LABEL,
} from '../announcements-labels';
import type { Announcement } from '../schemas';

const PORTRAIT_SPACING = 9;

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
  const { author } = announcement;
  const authorName = `${author.firstName} ${author.lastName}`;
  const validUntilLabel = toValidUntilLabel(announcement.validUntil);

  const newChip = isNew ? <KkChip tone="gold">{ANNOUNCEMENT_NEW_LABEL}</KkChip> : null;
  const expiredChip = isExpired ? (
    <KkChip tone="neutral">{ANNOUNCEMENT_EXPIRED_LABEL}</KkChip>
  ) : null;
  const officeLine =
    author.officeName === null ? null : <KkMeta tone="accent">{author.officeName}</KkMeta>;
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
            {validUntilLine}
          </Stack>
        </Stack>
        {actions}
      </Stack>
    </KkPanel>
  );
};

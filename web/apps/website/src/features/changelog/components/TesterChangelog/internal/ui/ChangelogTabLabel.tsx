import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { changelogCopy } from '@/features/changelog/changelog-copy';
import { CHANGELOG_ICONS } from '@/features/changelog/changelog-icons';
import type { ChangelogEntry } from '@/features/changelog/schemas';
import { formatLongDate } from '@/lib/date';

interface ChangelogTabLabelProps {
  entry: ChangelogEntry;
  unread: boolean;
}

export const ChangelogTabLabel: FC<ChangelogTabLabelProps> = ({ entry, unread }) => {
  const EntryIcon = CHANGELOG_ICONS[entry.icon];

  return (
    <Stack direction="row" sx={{ width: '100%', minWidth: 0, alignItems: 'center', gap: 1.5 }}>
      <EntryIcon fontSize="small" sx={{ flexShrink: 0 }} />
      <Stack sx={{ minWidth: 0, alignItems: 'flex-start', gap: 0.25 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'left' }}>
          {entry.title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {formatLongDate(entry.date)}
        </Typography>
      </Stack>
      {unread && (
        <Chip
          size="small"
          color="primary"
          label={changelogCopy.unreadMarker}
          sx={{
            ml: 'auto',
            flexShrink: 0,
            height: '1.25rem',
            typography: 'caption',
            letterSpacing: '0.08em',
          }}
        />
      )}
    </Stack>
  );
};

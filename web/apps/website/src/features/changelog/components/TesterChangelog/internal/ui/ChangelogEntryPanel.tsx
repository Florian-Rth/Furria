import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { ChangelogEntry } from '@/features/changelog/schemas';
import { formatLongDate } from '@/lib/date';
import { buildEntryHeadingId, buildPanelId } from '../logic/changelog-dialog-a11y';

interface ChangelogEntryPanelProps {
  entry: ChangelogEntry;
}

export const ChangelogEntryPanel: FC<ChangelogEntryPanelProps> = ({ entry }) => (
  <Stack
    role="tabpanel"
    tabIndex={0}
    id={buildPanelId(entry.id)}
    aria-labelledby={buildEntryHeadingId(entry.id)}
    sx={{ width: '100%', gap: { xs: 1.5, desktop: 2 } }}
  >
    <Stack sx={{ gap: 0.75 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 900,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {formatLongDate(entry.date)}
      </Typography>
      <Typography variant="h3" component="h3" id={buildEntryHeadingId(entry.id)}>
        {entry.title}
      </Typography>
    </Stack>
    <Stack component="ul" sx={{ gap: 1, m: 0, pl: 3, listStyleType: 'disc' }}>
      {entry.description.map((point) => (
        <Typography
          key={point}
          component="li"
          variant="body1"
          sx={{ color: 'text.secondary', textWrap: 'pretty' }}
        >
          {point}
        </Typography>
      ))}
    </Stack>
  </Stack>
);

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { ChangelogEntry } from '@/features/changelog/schemas';
import { formatLongDate } from '@/lib/date';
import { buildPanelId, buildTabId } from '../logic/changelog-dialog-a11y';

interface ChangelogEntryPanelProps {
  entry: ChangelogEntry;
}

export const ChangelogEntryPanel: FC<ChangelogEntryPanelProps> = ({ entry }) => (
  <Stack
    role="tabpanel"
    tabIndex={0}
    id={buildPanelId(entry.id)}
    aria-labelledby={buildTabId(entry.id)}
    sx={{ gap: { xs: 1.5, md: 2 } }}
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
      <Typography variant="h5" component="h3">
        {entry.title}
      </Typography>
    </Stack>
    {entry.description.map((paragraph) => (
      <Typography
        key={paragraph}
        variant="body1"
        sx={{ color: 'text.secondary', textWrap: 'pretty' }}
      >
        {paragraph}
      </Typography>
    ))}
  </Stack>
);

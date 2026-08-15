import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { LineupAct } from '@/features/events/event-detail-display';

interface EventLineupEntryProps {
  entry: LineupAct;
}

export const EventLineupEntry: FC<EventLineupEntryProps> = ({ entry }) => (
  <Stack
    component="li"
    direction="row"
    sx={{
      gap: 2,
      alignItems: 'baseline',
      py: 1.5,
      borderBottom: 1,
      borderColor: 'divider',
    }}
  >
    <Typography
      variant="caption"
      component="span"
      sx={{ fontWeight: 900, color: 'primary.main', minWidth: '1.5rem' }}
    >
      {entry.position}
    </Typography>
    <Typography variant="h5" component="span">
      {entry.act}
    </Typography>
  </Stack>
);

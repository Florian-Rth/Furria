import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface EventDateBlockProps {
  day: string;
  month: string;
}

export const EventDateBlock: FC<EventDateBlockProps> = ({ day, month }) => (
  <Stack data-kk-event-date sx={{ textAlign: 'center', flexShrink: 0, minWidth: 44 }}>
    <Typography variant="h2" component="span" sx={{ color: 'primary.main', lineHeight: 0.9 }}>
      {day}
    </Typography>
    <Typography
      variant="caption"
      sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}
    >
      {month}
    </Typography>
  </Stack>
);

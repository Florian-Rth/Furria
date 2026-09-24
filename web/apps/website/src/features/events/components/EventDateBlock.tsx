import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { formatDayOfMonth, formatMonthAbbreviation } from '@/lib/date';

interface EventDateBlockProps {
  startsAt: string;
  tint: string;
}

export const EventDateBlock: FC<EventDateBlockProps> = ({ startsAt, tint }) => {
  const day = formatDayOfMonth(startsAt);
  const month = formatMonthAbbreviation(startsAt);

  return (
    <Stack
      data-kk-event-date-block
      sx={{
        alignItems: 'center',
        flexShrink: 0,
        minWidth: '3.75rem',
        px: 1,
        py: 0.75,
        border: 1.5,
        borderColor: 'divider',
        borderTop: 3,
        borderTopColor: tint,
        borderRadius: `${kkTokens.radius.base}px`,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h2" component="span" sx={{ lineHeight: 1.1 }}>
        {day}
      </Typography>
      <Typography
        variant="caption"
        component="span"
        sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}
      >
        {month}
      </Typography>
    </Stack>
  );
};

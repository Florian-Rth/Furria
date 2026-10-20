import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkCalendarAgendaGapProps {
  label: string;
  anchor: string;
  days: readonly string[];
}

export const KkCalendarAgendaGap: FC<KkCalendarAgendaGapProps> = ({ label, anchor, days }) => (
  <Stack
    direction="row"
    data-kk-calendar-anchor={anchor}
    data-kk-calendar-gap={days.join(' ')}
    data-kk-calendar-day={days[0]}
    sx={{ alignItems: 'center', gap: 1, minHeight: '1.75rem', px: 0.75, minWidth: 0 }}
  >
    <Box
      aria-hidden
      component="span"
      sx={{
        width: '1.25rem',
        flexShrink: 0,
        borderTopWidth: kkTokens.line.hair,
        borderTopStyle: 'dashed',
        borderTopColor: 'divider',
      }}
    />
    <Typography component="p" variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
      {label}
    </Typography>
  </Stack>
);

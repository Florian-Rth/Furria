import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkEventTieProps {
  day: string;
  month: string;
  title: string;
  line: string;
  wrapsLine?: boolean;
}

export const KkEventTie: FC<KkEventTieProps> = ({ day, month, title, line, wrapsLine = false }) => (
  <Stack direction="row" data-kk-event-tie sx={{ gap: 1.5, alignItems: 'center', minWidth: 0 }}>
    <Stack
      sx={{
        width: 48,
        flexShrink: 0,
        py: 0.5,
        alignItems: 'center',
        borderRadius: 2,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
      }}
    >
      <Typography variant="h4" component="span" sx={{ lineHeight: 1 }}>
        {day}
      </Typography>
      <Typography
        variant="caption"
        component="span"
        sx={{ fontWeight: 800, letterSpacing: '0.1em' }}
      >
        {month}
      </Typography>
    </Stack>
    <Stack sx={{ minWidth: 0 }}>
      <Typography variant="body2" noWrap sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
      <Typography variant="caption" noWrap={!wrapsLine} sx={{ color: 'text.secondary' }}>
        {line}
      </Typography>
    </Stack>
  </Stack>
);

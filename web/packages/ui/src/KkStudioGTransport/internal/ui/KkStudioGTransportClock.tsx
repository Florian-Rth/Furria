import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioGTransportClockProps {
  time: string;
  count: string;
  label: string;
}

export const KkStudioGTransportClock: FC<KkStudioGTransportClockProps> = ({
  time,
  count,
  label,
}) => (
  <Stack
    role="timer"
    aria-label={label}
    aria-live="off"
    data-kk-studio-g-clock
    sx={{ minWidth: 0, gap: 0.25 }}
  >
    <Typography
      variant="h3"
      component="span"
      noWrap
      sx={{ lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}
    >
      {time}
    </Typography>
    <Typography
      variant="caption"
      component="span"
      noWrap
      sx={{
        lineHeight: 1,
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
        color: 'text.secondary',
      }}
    >
      {count}
    </Typography>
  </Stack>
);

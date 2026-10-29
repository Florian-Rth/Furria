import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioCTransportClockProps {
  now: string;
  total: string;
  label: string;
}

export const KkStudioCTransportClock: FC<KkStudioCTransportClockProps> = ({
  now,
  total,
  label,
}) => (
  <Stack
    aria-label={label}
    data-kk-studio-c-clock
    sx={{ flexShrink: 0, pl: 0.5, fontVariantNumeric: 'tabular-nums', rowGap: 0 }}
  >
    <Typography component="span" sx={{ typography: 'subtitle2', fontWeight: 800, lineHeight: 1.2 }}>
      {now}
    </Typography>
    <Typography
      component="span"
      sx={{ typography: 'caption', fontWeight: 700, color: 'text.secondary', lineHeight: 1.2 }}
    >
      {total}
    </Typography>
  </Stack>
);

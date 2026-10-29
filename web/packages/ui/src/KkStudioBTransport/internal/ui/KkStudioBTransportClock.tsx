import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const CLOCK = {
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: 0.5,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
} as const;

const NOW = {
  fontFamily: kkTokens.font.display,
  typography: 'subtitle1',
  lineHeight: 1,
  minWidth: '3.25rem',
} as const;

const TOTAL = { typography: 'caption', color: 'text.secondary', lineHeight: 1 } as const;

interface KkStudioBTransportClockProps {
  now: string;
  total: string;
}

export const KkStudioBTransportClock: FC<KkStudioBTransportClockProps> = ({ now, total }) => (
  <Box component="span" data-kk-studio-b-clock sx={CLOCK}>
    <Box component="span" sx={NOW}>
      {now}
    </Box>
    <Box component="span" sx={TOTAL}>
      {total}
    </Box>
  </Box>
);

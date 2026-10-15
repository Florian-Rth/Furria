import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { FlagTone } from '../honour-flag';
import { flagPlacementOf } from '../honour-flag';
import { coinFlagPaint, sashFlagPaint } from '../honour-paint';

const FLAG_LOOK = {
  typography: 'caption',
  fontWeight: 700,
  px: 1.25,
  py: 0.5,
} as const;

const flagPaints = { coin: coinFlagPaint, sash: sashFlagPaint } as const;

interface KkHonourFlagProps {
  label: string;
  tone: FlagTone;
}

export const KkHonourFlag: FC<KkHonourFlagProps> = ({ label, tone }) => {
  const placement = flagPlacementOf(tone);
  const paint = flagPaints[tone];

  return (
    <Box component="span" aria-hidden data-kk-honour-flag={tone} sx={[FLAG_LOOK, placement, paint]}>
      {label}
    </Box>
  );
};

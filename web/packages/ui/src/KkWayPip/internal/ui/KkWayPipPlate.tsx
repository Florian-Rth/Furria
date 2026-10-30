import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkWayPipPlateProps {
  eyebrow: string;
  text: string;
}

export const KkWayPipPlate: FC<KkWayPipPlateProps> = ({ eyebrow, text }) => (
  <Stack
    data-kk-way-pip-plate
    sx={{
      position: 'absolute',
      inset: 0,
      justifyContent: 'flex-end',
      gap: 0.25,
      p: 1.25,
      color: kkTokens.color.dark.ink,
      backgroundColor: `color-mix(in srgb, ${kkTokens.color.dark.darkroom} 90%, transparent)`,
      animation: 'kk-way-plate-in 320ms ease-out',
      '@keyframes kk-way-plate-in': { from: { opacity: 0 }, to: { opacity: 1 } },
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    }}
  >
    <Typography
      variant="overline"
      sx={{
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.type.tracking.label,
        lineHeight: 1.2,
        color: kkTokens.color.dark.sub,
      }}
    >
      {eyebrow}
    </Typography>
    <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1.3, color: 'inherit' }}>
      {text}
    </Typography>
  </Stack>
);

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

export interface KkTouchLabBand {
  key: string;
  x: number;
  width: number;
  label: string;
  selected: boolean;
}

const BAND_GAP = 2;

interface KkTouchLabBandsProps {
  bands: readonly KkTouchLabBand[];
}

export const KkTouchLabBands: FC<KkTouchLabBandsProps> = ({ bands }) => (
  <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    {bands.map((band) => (
      <Stack
        direction="row"
        key={band.key}
        data-selected={band.selected}
        style={{ left: band.x, width: Math.max(band.width - BAND_GAP, 1) }}
        sx={(theme) => ({
          position: 'absolute',
          top: '0.5rem',
          height: '1.75rem',
          px: 0.75,
          alignItems: 'center',
          borderRadius: `${kkTokens.radius.bar}px`,
          clipPath: 'inset(0)',
          backgroundColor: touchLabPalette(theme).action.hover,
          color: touchLabPalette(theme).text.secondary,
          '&[data-selected="true"]': {
            backgroundColor: touchLabPalette(theme).primary.main,
            color: touchLabPalette(theme).primary.contrastText,
          },
        })}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 800, whiteSpace: 'nowrap', color: 'inherit' }}
        >
          {band.label}
        </Typography>
      </Stack>
    ))}
  </Box>
);

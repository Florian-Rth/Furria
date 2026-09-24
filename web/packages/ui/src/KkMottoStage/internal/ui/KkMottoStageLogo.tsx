import Box from '@mui/material/Box';
import type { FC } from 'react';
import { logoInk } from '../../../internal/logo-ink';

const FADE = 'linear-gradient(to right, transparent 6%, #000 62%)';
const WIDTH = { xs: '74%', desktop: '56%' };
const LIGHT_OPACITY = 0.94;
const DARK_OPACITY = 0.82;

interface KkMottoStageLogoProps {
  source: string;
}

export const KkMottoStageLogo: FC<KkMottoStageLogoProps> = ({ source }) => (
  <Box
    aria-hidden
    data-kk-motto-stage-logo
    sx={{
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    <Box
      component="img"
      src={source}
      alt=""
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        width: WIDTH,
        objectFit: 'contain',
        objectPosition: 'right bottom',
        opacity: LIGHT_OPACITY,
        maskImage: FADE,
        WebkitMaskImage: FADE,
        ...logoInk(theme, { opacity: DARK_OPACITY }),
      })}
    />
  </Box>
);

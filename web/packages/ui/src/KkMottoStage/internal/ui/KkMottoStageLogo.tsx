import Box from '@mui/material/Box';
import type { FC } from 'react';

const FADE = 'linear-gradient(to right, transparent 6%, #000 62%)';
const WIDTH = { xs: '74%', desktop: '56%' };
const LIGHT_OPACITY = 0.94;
const DARK_OPACITY = 0.82;
const DARK_FILTER = 'invert(1) hue-rotate(180deg)';

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
        mixBlendMode: 'multiply',
        maskImage: FADE,
        WebkitMaskImage: FADE,
        ...theme.applyStyles('dark', {
          opacity: DARK_OPACITY,
          filter: DARK_FILTER,
          mixBlendMode: 'screen',
        }),
      })}
    />
  </Box>
);

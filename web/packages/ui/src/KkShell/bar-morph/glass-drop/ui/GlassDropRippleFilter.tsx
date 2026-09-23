import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { GlassWave } from '../logic/glass-drop-text';
import { rippleFrameAt } from '../logic/glass-drop-text';
import { useGlassRipple } from '../logic/use-glass-ripple';

const START = 0;

interface GlassDropRippleFilterProps {
  id: string;
  wave: GlassWave;
}

export const GlassDropRippleFilter: FC<GlassDropRippleFilterProps> = ({ id, wave }) => {
  const nodes = useGlassRipple(wave);
  const frame = rippleFrameAt(wave, START);

  return (
    <Box
      component="svg"
      aria-hidden
      width={0}
      height={0}
      sx={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
    >
      <filter id={id} x="-15%" y="-60%" width="130%" height="220%" colorInterpolationFilters="sRGB">
        <feTurbulence
          ref={nodes.turbulence}
          type="turbulence"
          baseFrequency={frame.frequency}
          numOctaves={2}
          seed={7}
          result="noise"
        />
        <feDisplacementMap
          ref={nodes.displacement}
          in="SourceGraphic"
          in2="noise"
          scale={frame.scale}
          xChannelSelector="R"
          yChannelSelector="G"
          result="warp"
        />
        <feGaussianBlur ref={nodes.blur} in="warp" stdDeviation={frame.deviation} />
      </filter>
    </Box>
  );
};

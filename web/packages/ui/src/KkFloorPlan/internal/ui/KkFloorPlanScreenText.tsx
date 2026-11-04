import Box from '@mui/material/Box';
import type { FC } from 'react';
import { planPalette, screenConstantAt } from '../floor-plan-paint';
import { useFloorPlanScale } from '../logic/floor-plan-context';

interface KkFloorPlanScreenTextProps {
  x: number;
  y: number;
  text: string;
  rotation?: number;
  emphasis?: boolean;
  quiet?: boolean;
}

export const KkFloorPlanScreenText: FC<KkFloorPlanScreenTextProps> = ({
  x,
  y,
  text,
  rotation = 0,
  emphasis = false,
  quiet = false,
}) => {
  const scale = useFloorPlanScale();

  return (
    <Box
      component="g"
      transform={`${screenConstantAt(x, y, scale)} rotate(${rotation})`}
      aria-hidden
      sx={{ pointerEvents: 'none' }}
    >
      <Box
        component="text"
        textAnchor="middle"
        dominantBaseline="central"
        sx={(theme) => ({
          fill: quiet ? planPalette(theme).text.secondary : planPalette(theme).text.primary,
          fontWeight: emphasis ? 800 : 600,
          letterSpacing: '0.02em',
          paintOrder: 'stroke',
          stroke: planPalette(theme).background.default,
          strokeWidth: 3,
          strokeLinejoin: 'round',
        })}
      >
        {text}
      </Box>
    </Box>
  );
};

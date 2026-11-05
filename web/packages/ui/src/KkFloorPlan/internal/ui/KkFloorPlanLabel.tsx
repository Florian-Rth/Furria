import Box from '@mui/material/Box';
import type { FC } from 'react';
import { hitAttributes, mutedPaint, placeAt, planPalette } from '../floor-plan-paint';

export type KkPlanLabelSize = 'small' | 'medium' | 'large';

interface KkFloorPlanLabelProps {
  id?: string;
  x: number;
  y: number;
  text: string;
  size: KkPlanLabelSize;
  rotation: number;
  selected?: boolean;
  muted?: boolean;
}

const CAPTION_PX = 12;

const heightCm: Record<KkPlanLabelSize, number> = {
  small: 30,
  medium: 60,
  large: 120,
};

export const KkFloorPlanLabel: FC<KkFloorPlanLabelProps> = ({
  id,
  x,
  y,
  text,
  size,
  rotation,
  selected = false,
  muted = false,
}) => {
  const grow = heightCm[size] / CAPTION_PX;

  return (
    <Box
      component="g"
      transform={`${placeAt(x, y, rotation)} scale(${grow})`}
      {...hitAttributes(id, muted)}
      data-kk-plan-label
      sx={mutedPaint(muted)}
    >
      <Box
        component="text"
        textAnchor="middle"
        dominantBaseline="central"
        sx={(theme) => ({
          fill: selected ? planPalette(theme).primary.main : planPalette(theme).text.primary,
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        })}
      >
        {text}
      </Box>
    </Box>
  );
};

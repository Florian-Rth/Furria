import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import {
  chipWidthPx,
  PLAN_CHIP_HEIGHT_PX,
  planPalette,
  STROKE,
  screenConstantAt,
  severityInk,
  severityTextFill,
} from '../floor-plan-paint';
import { useFloorPlanScale } from '../logic/floor-plan-context';

export type KkPlanChipTone = 'ink' | 'conflict' | 'hint' | 'accent';

interface KkFloorPlanChipProps {
  x: number;
  y: number;
  label: string;
  tone: KkPlanChipTone;
}

const groundOf = (theme: Theme, tone: KkPlanChipTone): CSSObject => {
  if (tone === 'ink') {
    return { fill: planPalette(theme).text.primary, stroke: 'none' };
  }
  if (tone === 'accent') {
    return { fill: planPalette(theme).primary.main, stroke: 'none' };
  }

  return {
    fill: planPalette(theme).background.paper,
    stroke: severityInk(theme, tone),
    strokeWidth: STROKE.section,
  };
};

const textOf = (theme: Theme, tone: KkPlanChipTone): CSSObject => {
  if (tone === 'ink') {
    return { fill: planPalette(theme).background.paper };
  }
  if (tone === 'accent') {
    return { fill: planPalette(theme).primary.contrastText };
  }

  return severityTextFill(theme, tone);
};

export const KkFloorPlanChip: FC<KkFloorPlanChipProps> = ({ x, y, label, tone }) => {
  const scale = useFloorPlanScale();
  const width = chipWidthPx(label);

  return (
    <Box
      component="g"
      aria-hidden
      transform={screenConstantAt(x, y, scale)}
      data-kk-plan-chip={tone}
      sx={{ pointerEvents: 'none' }}
    >
      <Box
        component="rect"
        x={-width / 2}
        y={-PLAN_CHIP_HEIGHT_PX / 2}
        width={width}
        height={PLAN_CHIP_HEIGHT_PX}
        rx={PLAN_CHIP_HEIGHT_PX / 2}
        sx={(theme) => groundOf(theme, tone)}
      />
      <Box
        component="text"
        textAnchor="middle"
        dominantBaseline="central"
        sx={(theme) => ({
          ...textOf(theme, tone),
          stroke: 'none',
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
        })}
      >
        {label}
      </Box>
    </Box>
  );
};

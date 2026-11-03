import Box from '@mui/material/Box';
import type { FC } from 'react';
import { percentOf, SCORE_FIGURES } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';
import { LANE_VARS } from '../timeline-paint';

export interface KkTimelineTick {
  share: number;
  label: string;
}

interface KkTimelineRulerProps {
  ticks: readonly KkTimelineTick[];
}

export const KkTimelineRuler: FC<KkTimelineRulerProps> = ({ ticks }) => {
  const marks = ticks.map((tick) => (
    <Box
      key={tick.share}
      component="span"
      style={{ left: percentOf(tick.share) }}
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        pl: 0.5,
        borderLeftWidth: kkTokens.line.hair,
        borderLeftStyle: 'solid',
        borderLeftColor: 'divider',
        typography: 'caption',
        lineHeight: `var(${LANE_VARS.ruler})`,
        fontWeight: 700,
        color: 'text.secondary',
        whiteSpace: 'nowrap',
        ...SCORE_FIGURES,
      }}
    >
      {tick.label}
    </Box>
  ));

  return (
    <Box
      aria-hidden
      data-kk-timeline-ruler
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: `var(${LANE_VARS.ruler})`,
        borderBottomWidth: kkTokens.line.hair,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
        pointerEvents: 'none',
      }}
    >
      {marks}
    </Box>
  );
};

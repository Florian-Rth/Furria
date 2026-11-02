import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { LANE_VARS, percentOf, SCORE_FIGURES } from '../score-paint';

export interface KkScoreTrackTick {
  share: number;
  label: string;
}

interface KkScoreTrackRulerProps {
  ticks: readonly KkScoreTrackTick[];
}

export const KkScoreTrackRuler: FC<KkScoreTrackRulerProps> = ({ ticks }) => {
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
      data-kk-score-ruler
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

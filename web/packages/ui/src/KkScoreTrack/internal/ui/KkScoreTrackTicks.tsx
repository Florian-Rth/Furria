import Box from '@mui/material/Box';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { kkTokens } from '../../../tokens';
import { LANE_VARS, stepsTop } from '../score-paint';
import type { KkScoreTrackTickMark } from './KkScoreTrackTick';
import { KkScoreTrackTick } from './KkScoreTrackTick';

const DROP_LEAD_SECONDS = 0.15;

interface KkScoreTrackTicksProps {
  ticks: readonly KkScoreTrackTickMark[];
  activeKey: number | null;
  revealSeconds: number | null;
}

export const KkScoreTrackTicks: FC<KkScoreTrackTicksProps> = ({
  ticks,
  activeKey,
  revealSeconds,
}) => {
  const marks = ticks.map((tick) => (
    <KkScoreTrackTick
      key={tick.key}
      tick={tick}
      active={tick.key === activeKey}
      dropDelay={revealSeconds === null ? null : DROP_LEAD_SECONDS + tick.from * revealSeconds}
    />
  ));

  return (
    <Box
      aria-hidden
      data-kk-score-ticks
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        right: 0,
        top: stepsTop,
        height: `var(${LANE_VARS.steps})`,
        borderTopWidth: kkTokens.line.hair,
        borderTopStyle: 'solid',
        borderTopColor: 'divider',
        backgroundColor: inkWash(theme, '3%'),
        pointerEvents: 'none',
      })}
    >
      {marks}
    </Box>
  );
};

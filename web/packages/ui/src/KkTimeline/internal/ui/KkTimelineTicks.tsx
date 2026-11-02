import Box from '@mui/material/Box';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { kkTokens } from '../../../tokens';
import { LANE_VARS, stepsTop } from '../timeline-paint';
import type { KkTimelineTickMark } from './KkTimelineTick';
import { KkTimelineTick } from './KkTimelineTick';

const DROP_LEAD_SECONDS = 0.15;

interface KkTimelineTicksProps {
  ticks: readonly KkTimelineTickMark[];
  activeKey: number | null;
  revealSeconds: number | null;
}

export const KkTimelineTicks: FC<KkTimelineTicksProps> = ({ ticks, activeKey, revealSeconds }) => {
  const marks = ticks.map((tick) => (
    <KkTimelineTick
      key={tick.key}
      tick={tick}
      active={tick.key === activeKey}
      dropDelay={revealSeconds === null ? null : DROP_LEAD_SECONDS + tick.from * revealSeconds}
    />
  ));

  return (
    <Box
      aria-hidden
      data-kk-timeline-ticks
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

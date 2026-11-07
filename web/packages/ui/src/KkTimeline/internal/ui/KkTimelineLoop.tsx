import Box from '@mui/material/Box';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { percentOf } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';
import { LANE_VARS } from '../timeline-paint';

export interface KkTimelineLoopRange {
  from: number;
  to: number;
}

interface KkTimelineLoopProps {
  range: KkTimelineLoopRange | null;
}

export const KkTimelineLoop: FC<KkTimelineLoopProps> = ({ range }) => {
  if (range === null) {
    return null;
  }

  const place = { left: percentOf(range.from), width: percentOf(range.to - range.from) };

  return (
    <Box
      aria-hidden
      data-kk-timeline-loop
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        top: `var(${LANE_VARS.ruler})`,
        bottom: 0,
        borderLeftWidth: kkTokens.line.section,
        borderRightWidth: kkTokens.line.section,
        borderLeftStyle: 'solid',
        borderRightStyle: 'solid',
        borderColor: 'text.primary',
        pointerEvents: 'none',
        zIndex: 2,
        backgroundColor: inkWash(theme, '8%'),
      })}
    />
  );
};

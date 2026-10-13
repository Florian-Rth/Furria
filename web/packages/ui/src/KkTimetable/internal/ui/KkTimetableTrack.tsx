import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import type { KkStatusLevel } from '../../../internal/status-paint';
import { statusTick } from '../../../internal/status-paint';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { kkTokens } from '../../../tokens';
import type { KkTrackState } from '../logic/timetable-track';

const { system, line } = kkTokens;
const CURSOR_WIDTH = 2;
const EMPTY = { scaleX: 0 } as const;
const FILLED = { scaleX: 1 } as const;
const SLIDE: Transition = { duration: system.fillSeconds, ease: [0.22, 0.61, 0.36, 1] };

const OVERRUN_LEVELS: Record<KkTrackState, KkStatusLevel> = {
  onDemand: 'unknown',
  onTime: 'ok',
  late: 'attention',
  overdue: 'broken',
};

const percentOf = (share: number): string => `${(share * 100).toFixed(2)}%`;

const centred: CSSObject = { position: 'absolute', top: '50%', transform: 'translateY(-50%)' };

const startPaint =
  (failed: boolean) =>
  (theme: Theme): CSSObject =>
    failed ? statusTick(theme, 'broken') : { backgroundColor: 'text.primary' };

interface KkTimetableTrackProps {
  state: KkTrackState;
  cursor: number;
  due: number;
  failed: boolean;
}

export const KkTimetableTrack: FC<KkTimetableTrackProps> = ({ state, cursor, due, failed }) => {
  const reduced = useReducedMotion();
  const walked = Math.min(cursor, due);
  const overrun = Math.max(cursor - due, 0);
  const at = { left: percentOf(cursor) };
  const from = reduced ? at : { left: '0%' };

  return (
    <Box
      aria-hidden
      data-kk-timetable-track={state}
      sx={{ position: 'relative', height: system.trackHeight, minWidth: 0 }}
    >
      <Box
        sx={(theme) => ({
          ...centred,
          left: 0,
          right: 0,
          height: line.hair,
          backgroundColor: inkWash(theme, '18%'),
        })}
      />
      <Box
        component={motion.div}
        initial={EMPTY}
        animate={FILLED}
        transition={SLIDE}
        sx={{
          ...centred,
          left: 0,
          width: percentOf(walked),
          height: line.section,
          transformOrigin: 'left center',
          backgroundColor: 'text.primary',
        }}
      />
      <Box
        sx={(theme) => ({
          ...centred,
          left: percentOf(due),
          width: percentOf(overrun),
          height: line.page,
          ...statusTick(theme, OVERRUN_LEVELS[state]),
        })}
      />
      <Box
        sx={[
          { position: 'absolute', left: 0, top: 0, bottom: 0, width: line.section },
          startPaint(failed),
        ]}
      />
      <Box
        sx={{
          position: 'absolute',
          left: percentOf(due),
          top: '15%',
          bottom: '15%',
          width: line.hair,
          backgroundColor: 'text.secondary',
        }}
      />
      <Box
        component={motion.div}
        initial={from}
        animate={at}
        transition={SLIDE}
        sx={{
          position: 'absolute',
          top: -2,
          bottom: -2,
          width: CURSOR_WIDTH,
          ml: `-${CURSOR_WIDTH / 2}px`,
          borderRadius: `${kkTokens.radius.bar}px`,
          backgroundColor: 'primary.main',
        }}
      />
    </Box>
  );
};

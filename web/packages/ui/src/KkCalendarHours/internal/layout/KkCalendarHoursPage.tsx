import Box from '@mui/material/Box';
import type { PanInfo, Variants } from 'motion/react';
import { AnimatePresence, motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkCalendarTravel } from '../../../KkCalendarStrip/calendar-strip-types';
import { kkTokens } from '../../../tokens';
import { hoursSwipeOf } from '../logic/calendar-hours-geometry';

const { screen } = kkTokens.shell;
const TRAVEL_DISTANCE = screen.lateralTravel * 3;
const DRAG_ELASTIC = 0.18;
const DRAG_BOUNDS = { left: 0, right: 0 } as const;

const TRAVEL_SHIFT: Record<KkCalendarTravel, number> = {
  earlier: -TRAVEL_DISTANCE,
  later: TRAVEL_DISTANCE,
  none: 0,
};

const PAGE_VARIANTS: Variants = {
  enter: (shift: number) => ({ x: shift, opacity: shift === 0 ? 1 : 0 }),
  settled: {
    x: 0,
    opacity: 1,
    transition: { duration: screen.travelSeconds * 1.25, ease: [0.22, 0.61, 0.36, 1] },
  },
  leave: (shift: number) => ({
    x: -shift,
    opacity: 0,
    transition: { duration: screen.fadeSeconds, ease: 'easeIn' },
  }),
};

interface KkCalendarHoursPageProps extends PropsWithChildren {
  pageKey: string;
  travel: KkCalendarTravel;
  onTravel: (travel: Exclude<KkCalendarTravel, 'none'>) => void;
}

export const KkCalendarHoursPage: FC<KkCalendarHoursPageProps> = ({
  pageKey,
  travel,
  onTravel,
  children,
}) => {
  const reduced = useReducedMotion();
  const shift = reduced ? 0 : TRAVEL_SHIFT[travel];

  const release = (_: PointerEvent, info: PanInfo): void => {
    const swiped = hoursSwipeOf(
      info.offset.x,
      info.velocity.x,
      kkTokens.calendarHours.swipeThreshold,
    );

    if (swiped !== 'none') {
      onTravel(swiped);
    }
  };

  return (
    <AnimatePresence mode="wait" custom={shift}>
      <Box
        key={pageKey}
        component={motion.div}
        custom={shift}
        variants={PAGE_VARIANTS}
        initial="enter"
        animate="settled"
        exit="leave"
        drag="x"
        dragConstraints={DRAG_BOUNDS}
        dragElastic={DRAG_ELASTIC}
        dragDirectionLock
        onDragEnd={release}
        sx={{ minWidth: 0, touchAction: 'pan-y' }}
      >
        {children}
      </Box>
    </AnimatePresence>
  );
};

import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { PanInfo, Variants } from 'motion/react';
import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { KK_CALENDAR_STICKY } from '../../calendar-sticky';
import type { KkCalendarTravel } from '../../calendar-strip-types';
import { slideOffsetOf, travelOfSwipe } from '../logic/strip-swipe';

const { morphSeconds, morphEase } = kkTokens.calendarStrip;
const CELL = KK_CALENDAR_STICKY.stripCell;
const SLIDE = { type: 'spring', stiffness: 380, damping: 36, mass: 0.8 } as const;
const HOLD_STILL = { left: 0, right: 0 } as const;
const ELASTIC = 0.22;
const OUTSIDE = '[data-kk-calendar-day-outside] [data-kk-calendar-day-numeral]';

const WINDOW: CSSProperties = {
  position: 'relative',
  display: 'grid',
  minWidth: 0,
  clipPath: 'inset(0 -6px)',
};

const PAGE: CSSProperties = { gridColumn: '1 / -1', gridRow: '1 / -1', touchAction: 'pan-y' };

const GRID: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gridAutoRows: `${CELL}px`,
};

const SLIDING: Variants = {
  enter: (travel: KkCalendarTravel) => ({ x: slideOffsetOf(travel, false), opacity: 0 }),
  shown: { x: '0%', opacity: 1 },
  leave: (travel: KkCalendarTravel) => ({ x: slideOffsetOf(travel, true), opacity: 0 }),
};

const FADING: Variants = {
  enter: { opacity: 0 },
  shown: { opacity: 1 },
  leave: { opacity: 0 },
};

const foldPaint =
  (open: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    minWidth: 0,
    [`& ${OUTSIDE}`]: {
      transition: `color ${morphSeconds}s ease-out`,
      ...(open ? { color: (theme.vars ?? theme).palette.text.disabled } : {}),
    },
  });

interface KkCalendarStripWeeksProps extends PropsWithChildren {
  rows: number;
  focusRow: number;
  open: boolean;
  pageKey: string;
  travel: KkCalendarTravel;
  onTravel: (travel: KkCalendarTravel) => void;
  sx?: KkSx;
}

export const KkCalendarStripWeeks: FC<KkCalendarStripWeeksProps> = ({
  rows,
  focusRow,
  open,
  pageKey,
  travel,
  onTravel,
  sx,
  children,
}) => {
  const reduced = useReducedMotion();
  const variants = reduced ? FADING : SLIDING;
  const morph = { duration: reduced ? 0 : morphSeconds, ease: morphEase };
  const frame = { height: open ? rows * CELL : CELL };
  const shift = { y: open ? 0 : -focusRow * CELL };

  const settle = (_event: PointerEvent, info: PanInfo): void => {
    const next = travelOfSwipe(info.offset.x, info.velocity.x);

    if (next !== 'none') {
      onTravel(next);
    }
  };

  return (
    <Box
      data-kk-calendar-strip-weeks={open ? 'open' : 'closed'}
      sx={[foldPaint(open), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <motion.div initial={false} animate={frame} transition={morph} style={WINDOW}>
        <AnimatePresence initial={false} custom={travel} mode="popLayout">
          <motion.div
            key={pageKey}
            custom={travel}
            variants={variants}
            initial="enter"
            animate="shown"
            exit="leave"
            transition={SLIDE}
            drag="x"
            dragConstraints={HOLD_STILL}
            dragElastic={ELASTIC}
            dragSnapToOrigin
            onDragEnd={settle}
            style={PAGE}
          >
            <motion.div initial={false} animate={shift} transition={morph} style={GRID}>
              {children}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Box>
  );
};

import Box from '@mui/material/Box';
import type { Variants } from 'motion/react';
import { AnimatePresence, motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { kkTokens } from '../../../tokens';
import type { KkMonthBoardTravel } from '../logic/month-board-types';

const { screen } = kkTokens.shell;

const TRAVEL_SHIFT: Record<KkMonthBoardTravel, number> = {
  earlier: -screen.lateralTravel,
  later: screen.lateralTravel,
  none: 0,
};

const PAGE_VARIANTS: Variants = {
  enter: (shift: number) => ({ x: shift, opacity: 0 }),
  settled: {
    x: 0,
    opacity: 1,
    transition: { duration: screen.travelSeconds, ease: [0.22, 0.61, 0.36, 1] },
  },
  leave: (shift: number) => ({
    x: -shift,
    opacity: 0,
    transition: { duration: screen.fadeSeconds, ease: 'easeIn' },
  }),
};

interface KkMonthBoardPageProps extends PropsWithChildren {
  pageKey: string;
  travel: KkMonthBoardTravel;
}

export const KkMonthBoardPage: FC<KkMonthBoardPageProps> = ({ pageKey, travel, children }) => {
  const reduced = useReducedMotion();
  const shift = reduced ? 0 : TRAVEL_SHIFT[travel];

  return (
    <AnimatePresence mode="wait" initial={false} custom={shift}>
      <Box
        key={pageKey}
        component={motion.div}
        custom={shift}
        variants={PAGE_VARIANTS}
        initial="enter"
        animate="settled"
        exit="leave"
        sx={{ minWidth: 0 }}
      >
        {children}
      </Box>
    </AnimatePresence>
  );
};

import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import { useGreetingStage } from '../logic/greeting-context';
import { lineCueOf } from '../logic/greeting-cues';

const ONE_LINE = 1;

const LINE_PAINT = {
  typography: 'body2',
  fontWeight: 600,
  color: 'text.secondary',
  ...lineClamp(ONE_LINE),
} as const;

interface KkGreetingLineProps {
  children: string;
}

export const KkGreetingLine: FC<KkGreetingLineProps> = ({ children }) => {
  const { play, board, phase } = useGreetingStage();
  const cue = lineCueOf(play, board?.schedule.line ?? null, phase);
  const target = { opacity: cue.opacity, y: cue.y };
  const transition = { delay: cue.delay, duration: cue.duration, ease: 'easeOut' as const };

  return (
    <Typography
      key={cue.stance}
      component={motion.p}
      data-kk-greeting-line
      initial={false}
      animate={target}
      transition={transition}
      sx={LINE_PAINT}
    >
      {children}
    </Typography>
  );
};

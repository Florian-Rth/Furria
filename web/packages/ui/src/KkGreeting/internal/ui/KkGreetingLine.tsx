import Typography from '@mui/material/Typography';
import { easeOut, motion, useTransform } from 'motion/react';
import type { FC } from 'react';
import { useGreetingStage } from '../logic/greeting-context';
import { cueShareAt, lineCueOf } from '../logic/greeting-cues';

const LINE_DROP = 4;

const LINE_PAINT = {
  typography: 'body2',
  fontWeight: 600,
  color: 'text.secondary',
  textWrap: 'pretty',
} as const;

interface KkGreetingLineProps {
  children: string;
}

export const KkGreetingLine: FC<KkGreetingLineProps> = ({ children }) => {
  const { schedule, phase, clock } = useGreetingStage();
  const cue = lineCueOf(schedule?.line ?? null, phase);
  const opacity = useTransform(clock, (elapsed: number): number =>
    easeOut(cueShareAt(cue, elapsed)),
  );
  const y = useTransform(opacity, (shown: number): number => LINE_DROP * (1 - shown));
  const entry = { opacity, y };

  return (
    <motion.div data-kk-greeting-line style={entry}>
      <Typography sx={LINE_PAINT}>{children}</Typography>
    </motion.div>
  );
};

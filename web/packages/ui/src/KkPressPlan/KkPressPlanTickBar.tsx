import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { PressPlanBar } from './press-plan-bars';

const STROKE_WIDTH = 2;
const DRAW_SECONDS = 0.34;

interface KkPressPlanTickBarProps {
  bar: PressPlanBar;
  delaySeconds: number;
}

export const KkPressPlanTickBar: FC<KkPressPlanTickBarProps> = ({ bar, delaySeconds }) => {
  const style: CSSProperties = {
    position: 'absolute',
    top: bar.top,
    bottom: bar.bottom,
    left: `calc(50% + ${bar.shift}px)`,
    translate: `0 ${bar.lift}px`,
    borderLeftWidth: STROKE_WIDTH,
    borderLeftStyle: bar.dashed ? 'dashed' : 'solid',
    borderLeftColor: 'currentColor',
    rotate: `${bar.slant}deg`,
    transformOrigin: 'bottom',
  };

  return (
    <Box
      component="span"
      aria-hidden
      sx={(theme) => ({ position: 'absolute', inset: 0, ...bar.paint(theme) })}
    >
      <motion.span
        style={style}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: delaySeconds, duration: DRAW_SECONDS, ease: 'easeOut' }}
      />
    </Box>
  );
};

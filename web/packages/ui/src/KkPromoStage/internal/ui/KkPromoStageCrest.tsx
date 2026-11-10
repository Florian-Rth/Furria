import Box from '@mui/material/Box';
import { animate, motion, useMotionValue, useMotionValueEvent } from 'motion/react';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  BROOM_CROSS_ANGLE,
  BROOM_CROSS_ORIGIN,
  BROOM_VIEWBOX,
  BroomGlyph,
} from '../../../internal/broom-glyph';
import { usePromoScene } from '../logic/promo-scene-context';
import { PROMO_SLAM } from '../promo-motion';

const viewBox = `${BROOM_VIEWBOX.x} ${BROOM_VIEWBOX.y} ${BROOM_VIEWBOX.width} ${BROOM_VIEWBOX.height}`;
const SWING = 150;
const CROSS_SPRING = { type: 'spring', stiffness: 210, damping: 11, mass: 1.1 } as const;

interface KkPromoStageCrestProps {
  size: number;
  delay?: number;
}

export const KkPromoStageCrest: FC<KkPromoStageCrestProps> = ({ size, delay = 0.1 }) => {
  const { live } = usePromoScene();
  const swing = useMotionValue(SWING);
  const [open, setOpen] = useState(SWING);
  const leftBroom = `rotate(${-BROOM_CROSS_ANGLE - open} ${BROOM_CROSS_ORIGIN})`;
  const rightBroom = `rotate(${BROOM_CROSS_ANGLE + open} ${BROOM_CROSS_ORIGIN})`;

  useMotionValueEvent(swing, 'change', setOpen);
  const height = (size * BROOM_VIEWBOX.height) / BROOM_VIEWBOX.width;

  useEffect(() => {
    if (!live) {
      swing.set(SWING);
      return;
    }
    const run = animate(swing, 0, { ...CROSS_SPRING, delay });

    return () => {
      run.stop();
    };
  }, [live, delay, swing]);

  return (
    <Box
      component={motion.div}
      data-kk-promo-crest
      initial={{ scale: 0.2, opacity: 0 }}
      animate={live ? { scale: 1, opacity: 1 } : { scale: 0.2, opacity: 0 }}
      transition={{ ...PROMO_SLAM, delay: live ? delay : 0 }}
      sx={{ color: 'primary.main' }}
    >
      <Box
        component="svg"
        viewBox={viewBox}
        width={size}
        height={height}
        aria-hidden
        sx={{ display: 'block', fill: 'currentColor' }}
      >
        <g transform={leftBroom}>
          <BroomGlyph />
        </g>
        <g transform={rightBroom}>
          <BroomGlyph />
        </g>
      </Box>
    </Box>
  );
};

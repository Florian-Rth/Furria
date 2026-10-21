import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import type { FC } from 'react';
import { useEffect } from 'react';
import { redInk } from '../../../internal/red-ink';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import { useTileLanding } from '../logic/tile-context';
import { tileLandDelaySeconds } from '../logic/tile-land';
import { DISPLAY_NUMBER, goldInk } from '../tile-paint';

export type KkStartTileCountTone = 'ink' | 'gold' | 'red';
export type KkStartTileCountSize = 'small' | 'medium' | 'large';

const COUNT_AFTER_LAND_MS = 260;
const COUNT_SECONDS = 0.9;
const COUNT_EASE = [0.16, 1, 0.3, 1] as const;

const VARIANTS = { small: 'h3', medium: 'h2', large: 'h1' } as const;

const tonePaints: Record<KkStartTileCountTone, (theme: Theme) => CSSObject> = {
  ink: () => ({ color: 'text.primary' }),
  gold: goldInk,
  red: redInk,
};

const roundedOf = (value: number): string => String(Math.round(value));

interface KkStartTileCountProps {
  value: number;
  tone?: KkStartTileCountTone;
  size?: KkStartTileCountSize;
}

export const KkStartTileCount: FC<KkStartTileCountProps> = ({
  value,
  tone = 'ink',
  size = 'medium',
}) => {
  const { order } = useTileLanding();
  const reducedMotion = useReducedMotion();
  const count = useMotionValue(reducedMotion ? value : 0);
  const shown = useTransform(count, roundedOf);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: COUNT_SECONDS,
      delay: tileLandDelaySeconds(order, COUNT_AFTER_LAND_MS),
      ease: COUNT_EASE,
    });

    return () => {
      controls.stop();
    };
  }, [count, value, order]);

  return (
    <Typography
      component="span"
      variant={VARIANTS[size]}
      data-kk-start-tile-count
      sx={[DISPLAY_NUMBER, tonePaints[tone]]}
    >
      <motion.span aria-hidden>{shown}</motion.span>
      <KkVisuallyHidden>{String(value)}</KkVisuallyHidden>
    </Typography>
  );
};

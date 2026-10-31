import { motion, useReducedMotion } from 'motion/react';
import type { FC } from 'react';
import { useId } from 'react';
import type { KkColorSchemeMode } from './theme-color';

interface RayLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dawn: boolean;
}

const rayLines: readonly RayLine[] = [
  { x1: 12, y1: 1, x2: 12, y2: 3, dawn: false },
  { x1: 12, y1: 21, x2: 12, y2: 23, dawn: false },
  { x1: 1, y1: 12, x2: 3, y2: 12, dawn: true },
  { x1: 21, y1: 12, x2: 23, y2: 12, dawn: false },
  { x1: 5.64, y1: 5.64, x2: 4.22, y2: 4.22, dawn: true },
  { x1: 18.36, y1: 5.64, x2: 19.78, y2: 4.22, dawn: false },
  { x1: 5.64, y1: 18.36, x2: 4.22, y2: 19.78, dawn: true },
  { x1: 18.36, y1: 18.36, x2: 19.78, y2: 19.78, dawn: false },
];

interface MorphPose {
  turn: number;
  discRadius: number;
  bite: { cx: number; cy: number; r: number };
  rays: { opacity: number; scale: number; rotate: number };
}

const poses: Record<KkColorSchemeMode, MorphPose> = {
  light: {
    turn: 0,
    discRadius: 5,
    bite: { cx: 33, cy: 0, r: 9 },
    rays: { opacity: 1, scale: 1, rotate: 0 },
  },
  dark: {
    turn: 270,
    discRadius: 9,
    bite: { cx: 17, cy: 8, r: 9 },
    rays: { opacity: 0, scale: 0, rotate: -30 },
  },
  system: {
    turn: 0,
    discRadius: 7,
    bite: { cx: 18, cy: 7, r: 6 },
    rays: { opacity: 1, scale: 1, rotate: 0 },
  },
};

const rayOpacity = (ray: RayLine, scheme: KkColorSchemeMode): number =>
  scheme === 'system' && !ray.dawn ? 0 : 1;

interface KkSunMoonMorphIconProps {
  scheme: KkColorSchemeMode;
}

export const KkSunMoonMorphIcon: FC<KkSunMoonMorphIconProps> = ({ scheme }) => {
  const maskId = `sun-moon-mask-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const reducedMotion = useReducedMotion();
  const spring =
    reducedMotion === true
      ? { duration: 0 }
      : { type: 'spring' as const, stiffness: 380, damping: 30 };
  const pose = poses[scheme];
  const rays = rayLines.map((ray) => (
    <motion.line
      key={`${ray.x1}-${ray.y1}`}
      x1={ray.x1}
      y1={ray.y1}
      x2={ray.x2}
      y2={ray.y2}
      initial={false}
      animate={{ opacity: rayOpacity(ray, scheme) }}
      transition={spring}
    />
  ));

  return (
    <motion.svg
      aria-hidden
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      initial={false}
      animate={{ rotate: pose.turn }}
      transition={spring}
      style={{ overflow: 'visible' }}
    >
      <mask id={maskId}>
        <rect width="100%" height="100%" fill="white" />
        <motion.circle fill="black" initial={false} animate={pose.bite} transition={spring} />
      </mask>
      <motion.circle
        cx={12}
        cy={12}
        fill="currentColor"
        stroke="none"
        mask={`url(#${maskId})`}
        initial={false}
        animate={{ r: pose.discRadius }}
        transition={spring}
      />
      <motion.g
        initial={false}
        animate={pose.rays}
        transition={spring}
        style={{ transformOrigin: '12px 12px' }}
      >
        {rays}
      </motion.g>
    </motion.svg>
  );
};

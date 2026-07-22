import { motion, useReducedMotion } from 'motion/react';
import type { FC } from 'react';
import { useId } from 'react';

const rayLines = [
  { x1: 12, y1: 1, x2: 12, y2: 3 },
  { x1: 12, y1: 21, x2: 12, y2: 23 },
  { x1: 1, y1: 12, x2: 3, y2: 12 },
  { x1: 21, y1: 12, x2: 23, y2: 12 },
  { x1: 5.64, y1: 5.64, x2: 4.22, y2: 4.22 },
  { x1: 18.36, y1: 5.64, x2: 19.78, y2: 4.22 },
  { x1: 5.64, y1: 18.36, x2: 4.22, y2: 19.78 },
  { x1: 18.36, y1: 18.36, x2: 19.78, y2: 19.78 },
];

interface SunMoonMorphIconProps {
  dark: boolean;
}

export const SunMoonMorphIcon: FC<SunMoonMorphIconProps> = ({ dark }) => {
  const maskId = `sun-moon-mask-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const reducedMotion = useReducedMotion();
  const spring =
    reducedMotion === true
      ? { duration: 0 }
      : { type: 'spring' as const, stiffness: 380, damping: 30 };

  return (
    <motion.svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      initial={false}
      animate={{ rotate: dark ? 270 : 0 }}
      transition={spring}
      style={{ overflow: 'visible' }}
    >
      <mask id={maskId}>
        <rect width="100%" height="100%" fill="white" />
        <motion.circle
          r={9}
          fill="black"
          initial={false}
          animate={{ cx: dark ? 17 : 33, cy: dark ? 8 : 0 }}
          transition={spring}
        />
      </mask>
      <motion.circle
        cx={12}
        cy={12}
        fill="currentColor"
        stroke="none"
        mask={`url(#${maskId})`}
        initial={false}
        animate={{ r: dark ? 9 : 5 }}
        transition={spring}
      />
      <motion.g
        initial={false}
        animate={{ opacity: dark ? 0 : 1, scale: dark ? 0 : 1, rotate: dark ? -30 : 0 }}
        transition={spring}
        style={{ transformOrigin: '12px 12px' }}
      >
        {rayLines.map((line) => (
          <line key={`${line.x1}-${line.y1}`} {...line} />
        ))}
      </motion.g>
    </motion.svg>
  );
};

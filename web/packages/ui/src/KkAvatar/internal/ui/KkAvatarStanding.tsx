import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { arcPath } from '../../../internal/honours/honour-geometry';
import { FEE_BEAD_ARC } from '../../../internal/honours/honour-metrics';
import type { MotionStaging } from '../../../internal/honours/honour-motion';
import {
  settledAt,
  standingTransition,
  VIEW_BOX_ORIGIN,
} from '../../../internal/honours/honour-motion';
import { feeBeadPaint, membershipPaint } from '../../../internal/honours/honour-paint';
import type { KkStandingMembership } from '../../../internal/honours/honour-types';

const BEAD_SHARE = 2.6;
const DOT_GAP = 2;

const SETTLED = { opacity: 1, rotate: 0 } as const;
const SETTLE: MotionStaging = {
  initial: { opacity: 0, rotate: -40 },
  animate: SETTLED,
  transition: standingTransition,
};
const STILL = settledAt(SETTLED);

interface KkAvatarStandingProps {
  box: number;
  radius: number;
  stroke: number;
  membership: KkStandingMembership;
  feeReduced: boolean;
  arrive: boolean;
}

export const KkAvatarStanding: FC<KkAvatarStandingProps> = ({
  box,
  radius,
  stroke,
  membership,
  feeReduced,
  arrive,
}) => {
  const center = box / 2;
  const dash = membership === 'none' ? `${stroke} ${stroke * DOT_GAP}` : undefined;
  const beadPath = arcPath(center, radius, FEE_BEAD_ARC);
  const beadWidth = stroke * BEAD_SHARE;
  const settle = arrive ? SETTLE : STILL;
  const line = membershipPaint(membership);
  const bead = feeReduced ? (
    <Box
      component="path"
      d={beadPath}
      fill="none"
      strokeWidth={beadWidth}
      strokeLinecap="round"
      sx={feeBeadPaint}
    />
  ) : null;

  return (
    <motion.g
      data-kk-avatar-standing={membership}
      initial={settle.initial}
      animate={settle.animate}
      transition={settle.transition}
      style={VIEW_BOX_ORIGIN}
    >
      <Box
        component="circle"
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        strokeDasharray={dash}
        sx={line}
      />
      {bead}
    </motion.g>
  );
};

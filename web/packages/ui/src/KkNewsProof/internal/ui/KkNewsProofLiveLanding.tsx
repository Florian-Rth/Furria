import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { TargetAndTransition } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { useStampLife } from '../../../internal/use-stamp-life';

const STAGGER_SECONDS = 0.09;
const SHOWN_MS = 4200;
const LIFTED: TargetAndTransition = { opacity: 0, scale: 1.8, rotate: -22, y: -18 };
const LEAVING: TargetAndTransition = {
  opacity: 0,
  scale: 0.9,
  rotate: -6,
  y: -6,
  transition: { duration: 0.4, ease: 'easeIn' },
};

interface KkNewsProofLiveLandingProps {
  label: string;
  order: number;
  top: number;
}

export const KkNewsProofLiveLanding: FC<KkNewsProofLiveLandingProps> = ({ label, order, top }) => {
  const theme = useTheme();
  const { life, leave } = useStampLife(SHOWN_MS);

  if (life === 'gone') {
    return null;
  }

  const landed: TargetAndTransition = {
    opacity: 1,
    scale: 1,
    rotate: -6,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 520,
      damping: 22,
      mass: 0.8,
      delay: order * STAGGER_SECONDS,
    },
  };
  const target = life === 'leaving' ? LEAVING : landed;
  const placement: CSSProperties = {
    position: 'absolute',
    top: theme.spacing(top),
    right: theme.spacing(1),
    zIndex: 1,
  };

  return (
    <motion.span
      aria-hidden
      initial={LIFTED}
      animate={target}
      onAnimationComplete={leave}
      style={placement}
    >
      <Typography
        component="span"
        variant="overline"
        sx={{
          display: 'block',
          px: 1,
          lineHeight: 1.6,
          fontWeight: 900,
          color: 'primary.contrastText',
          bgcolor: 'primary.main',
          borderRadius: 1,
          boxShadow: 2,
        }}
      >
        {label}
      </Typography>
    </motion.span>
  );
};

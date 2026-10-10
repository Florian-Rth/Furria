import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkPressPhase } from '../../press-beats';
import { ROLL_TRANSITION } from '../logic/press-motion';

const rollerPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;
  return {
    position: 'absolute',
    left: theme.spacing(-1),
    right: theme.spacing(-1),
    height: theme.spacing(3.5),
    marginTop: theme.spacing(-1.75),
    borderRadius: `${kkTokens.radius.bar}px`,
    pointerEvents: 'none',
    backgroundImage: `linear-gradient(to bottom, transparent 0%, color-mix(in srgb, ${palette.text.primary} 55%, transparent) 38%, ${palette.text.primary} 52%, ${palette.primary.main} 60%, transparent 100%)`,
    boxShadow: kkTokens.shadow.floating,
  };
};

interface KkPressRollerProps {
  phase: KkPressPhase;
  runKey: number;
}

export const KkPressRoller: FC<KkPressRollerProps> = ({ phase, runKey }) => {
  if (phase !== 'strike') {
    return null;
  }

  return (
    <Box
      key={runKey}
      component={motion.div}
      aria-hidden
      data-kk-press-roller
      initial={{ top: '0%', opacity: 1 }}
      animate={{ top: '100%', opacity: [1, 1, 0] }}
      transition={{ top: ROLL_TRANSITION, opacity: { ...ROLL_TRANSITION, times: [0, 0.9, 1] } }}
      sx={rollerPaint}
    />
  );
};

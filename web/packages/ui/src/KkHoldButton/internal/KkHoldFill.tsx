import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { TargetAndTransition, Transition } from 'motion/react';
import { motion, useReducedMotion } from 'motion/react';
import type { FC } from 'react';
import type { KkButtonTone } from '../../KkButton';
import { kkTokens } from '../../tokens';

const SECONDS = 1000;
const RETRACT_SECONDS = 0.18;
const FILL_STRENGTH = '34%';

const fillInkOf = (theme: Theme, tone: KkButtonTone): string => {
  const palette = (theme.vars ?? theme).palette;
  return tone === 'danger' ? palette.error.contrastText : palette.primary.contrastText;
};

const fillTargetOf = (holding: boolean, reduced: boolean): TargetAndTransition => {
  const reach = holding ? 1 : 0;
  return reduced ? { scaleX: 1, opacity: reach } : { scaleX: reach, opacity: 1 };
};

interface KkHoldFillProps {
  holding: boolean;
  holdMs: number;
  tone: KkButtonTone;
}

export const KkHoldFill: FC<KkHoldFillProps> = ({ holding, holdMs, tone }) => {
  const reduced = useReducedMotion() === true;
  const transition: Transition = holding
    ? { duration: holdMs / SECONDS, ease: 'linear' }
    : { duration: RETRACT_SECONDS, ease: 'easeOut' };
  const resting = fillTargetOf(false, reduced);
  const target = fillTargetOf(holding, reduced);

  return (
    <Box
      component={motion.span}
      aria-hidden
      data-kk-hold-fill
      initial={resting}
      animate={target}
      transition={transition}
      sx={(theme) => {
        const ink = fillInkOf(theme, tone);
        return {
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          transformOrigin: 'left',
          backgroundColor: `color-mix(in srgb, ${ink} ${FILL_STRENGTH}, transparent)`,
          boxShadow: `inset -${kkTokens.line.section}px 0 0 ${ink}`,
          zIndex: 0,
        };
      }}
    />
  );
};

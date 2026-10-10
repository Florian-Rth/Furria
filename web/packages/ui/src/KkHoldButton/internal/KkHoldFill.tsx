import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { kkTokens } from '../../tokens';

const SECONDS = 1000;
const RETRACT_SECONDS = 0.18;
const FILL_STRENGTH = '34%';

interface KkHoldFillProps {
  holding: boolean;
  holdMs: number;
}

export const KkHoldFill: FC<KkHoldFillProps> = ({ holding, holdMs }) => {
  const transition = holding
    ? { duration: holdMs / SECONDS, ease: 'linear' as const }
    : { duration: RETRACT_SECONDS, ease: 'easeOut' as const };
  const scaleX = holding ? 1 : 0;

  return (
    <Box
      component={motion.span}
      aria-hidden
      data-kk-hold-fill
      initial={{ scaleX: 0 }}
      animate={{ scaleX }}
      transition={transition}
      sx={(theme) => {
        const palette = (theme.vars ?? theme).palette;
        return {
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          transformOrigin: 'left',
          backgroundColor: `color-mix(in srgb, ${palette.primary.contrastText} ${FILL_STRENGTH}, transparent)`,
          boxShadow: `inset -${kkTokens.line.section}px 0 0 ${palette.primary.contrastText}`,
          zIndex: 0,
        };
      }}
    />
  );
};

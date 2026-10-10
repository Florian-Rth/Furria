import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { TargetAndTransition, Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { kkTokens } from '../../tokens';

const HINT_SECONDS = 1.8;
const HINT_FRAMES: TargetAndTransition = { opacity: [0, 1, 1, 0], y: [6, 0, 0, -4] };
const HINT_TIMING: Transition = {
  duration: HINT_SECONDS,
  times: [0, 0.12, 0.8, 1],
  ease: 'easeOut',
};

interface KkHoldHintProps {
  hint: string;
  pulseKey: number;
}

export const KkHoldHint: FC<KkHoldHintProps> = ({ hint, pulseKey }) => {
  if (pulseKey === 0) {
    return null;
  }

  return (
    <Stack
      key={pulseKey}
      aria-hidden
      data-kk-hold-hint
      sx={(theme) => ({
        position: 'absolute',
        right: 0,
        bottom: `calc(100% + ${theme.spacing(1)})`,
        alignItems: 'flex-end',
        pointerEvents: 'none',
        zIndex: 1,
      })}
    >
      <Box
        component={motion.span}
        initial={{ opacity: 0 }}
        animate={HINT_FRAMES}
        transition={HINT_TIMING}
        sx={(theme) => ({
          typography: 'caption',
          fontWeight: 800,
          whiteSpace: 'nowrap',
          px: 1.25,
          py: 0.5,
          borderRadius: `${kkTokens.radius.bar}px`,
          color: (theme.vars ?? theme).palette.background.paper,
          backgroundColor: (theme.vars ?? theme).palette.text.primary,
          boxShadow: kkTokens.shadow.floating,
        })}
      >
        {hint}
      </Box>
    </Stack>
  );
};

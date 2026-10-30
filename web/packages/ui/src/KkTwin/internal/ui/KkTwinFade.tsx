import Box from '@mui/material/Box';
import { AnimatePresence, motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';

const FADE_SECONDS = 0.32;
const FADE_EASE = [0.22, 0.61, 0.36, 1] as const;
const HIDDEN = { opacity: 0 } as const;
const SHOWN = { opacity: 1 } as const;
const FADE = { duration: FADE_SECONDS, ease: FADE_EASE } as const;

interface KkTwinFadeProps extends PropsWithChildren {
  fadeKey: string;
}

export const KkTwinFade: FC<KkTwinFadeProps> = ({ fadeKey, children }) => (
  <Box sx={{ position: 'relative', width: '100%', height: '100%', minWidth: 0 }}>
    <AnimatePresence initial={false}>
      <Box
        key={fadeKey}
        component={motion.div}
        initial={HIDDEN}
        animate={SHOWN}
        exit={HIDDEN}
        transition={FADE}
        sx={{ position: 'absolute', inset: 0, minWidth: 0, display: 'grid', alignItems: 'center' }}
      >
        {children}
      </Box>
    </AnimatePresence>
  </Box>
);

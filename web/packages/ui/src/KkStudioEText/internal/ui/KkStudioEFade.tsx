import Box from '@mui/material/Box';
import { AnimatePresence, motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

const FADE_SECONDS = 0.32;
const FADE_EASE = [0.22, 0.61, 0.36, 1] as const;
const HIDDEN_BELOW = { opacity: 0, y: '0.375rem' } as const;
const SHOWN = { opacity: 1, y: 0 } as const;
const HIDDEN_ABOVE = { opacity: 0, y: '-0.375rem' } as const;

interface KkStudioEFadeProps extends PropsWithChildren {
  fadeKey: string;
  sx?: KkSx;
}

export const KkStudioEFade: FC<KkStudioEFadeProps> = ({ fadeKey, sx, children }) => (
  <Box sx={[{ position: 'relative', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    <AnimatePresence initial={false}>
      <Box
        key={fadeKey}
        component={motion.div}
        initial={HIDDEN_BELOW}
        animate={SHOWN}
        exit={HIDDEN_ABOVE}
        transition={{ duration: FADE_SECONDS, ease: FADE_EASE }}
        sx={{ position: 'absolute', inset: 0, minWidth: 0 }}
      >
        {children}
      </Box>
    </AnimatePresence>
  </Box>
);

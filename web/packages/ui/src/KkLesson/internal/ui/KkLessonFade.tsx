import Box from '@mui/material/Box';
import { AnimatePresence, motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

const FADE_SECONDS = 0.32;
const FADE_EASE = [0.22, 0.61, 0.36, 1] as const;
const HIDDEN = { opacity: 0 } as const;
const SHOWN = { opacity: 1 } as const;

interface KkLessonFadeProps extends PropsWithChildren {
  fadeKey: string;
  sx?: KkSx;
}

export const KkLessonFade: FC<KkLessonFadeProps> = ({ fadeKey, sx, children }) => (
  <Box sx={[{ position: 'relative', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    <AnimatePresence initial={false}>
      <Box
        key={fadeKey}
        component={motion.div}
        initial={HIDDEN}
        animate={SHOWN}
        exit={HIDDEN}
        transition={{ duration: FADE_SECONDS, ease: FADE_EASE }}
        sx={{ position: 'absolute', inset: 0, minWidth: 0 }}
      >
        {children}
      </Box>
    </AnimatePresence>
  </Box>
);

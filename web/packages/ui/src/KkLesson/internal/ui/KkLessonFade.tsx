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
  silent?: boolean;
  sx?: KkSx;
}

export const KkLessonFade: FC<KkLessonFadeProps> = ({ fadeKey, silent, sx, children }) => (
  <Box
    component="span"
    aria-hidden={silent}
    sx={[
      { display: 'block', position: 'relative', minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <AnimatePresence initial={false}>
      <Box
        key={fadeKey}
        component={motion.span}
        initial={HIDDEN}
        animate={SHOWN}
        exit={HIDDEN}
        transition={{ duration: FADE_SECONDS, ease: FADE_EASE }}
        sx={{ display: 'block', position: 'absolute', inset: 0, minWidth: 0 }}
      >
        {children}
      </Box>
    </AnimatePresence>
  </Box>
);

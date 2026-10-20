import Box from '@mui/material/Box';
import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { useFaceMorph } from '../logic/use-face-morph';

const { morphSeconds } = kkTokens.calendarStrip;
const SHOWN = { opacity: 1 } as const;
const HIDDEN = { opacity: 0 } as const;
const FACE: CSSProperties = { minWidth: 0 };

interface KkCalendarStripBodyProps extends PropsWithChildren {
  face: string;
  sx?: KkSx;
}

export const KkCalendarStripBody: FC<KkCalendarStripBodyProps> = ({ face, sx, children }) => {
  const reduced = useReducedMotion();
  const { frame, content } = useFaceMorph(face, reduced);
  const fade = { duration: reduced ? 0 : morphSeconds * 0.7 };

  return (
    <Box
      ref={frame}
      data-kk-calendar-strip-body={face}
      sx={[
        { position: 'relative', minWidth: 0, clipPath: 'inset(-6px -6px 0 -6px)' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box ref={content} sx={{ position: 'relative', minWidth: 0 }}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={face}
            initial={HIDDEN}
            animate={SHOWN}
            exit={HIDDEN}
            transition={fade}
            style={FACE}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

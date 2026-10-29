import Box from '@mui/material/Box';
import { AnimatePresence, motion } from 'motion/react';
import type { FC } from 'react';

const NOTE_ENTER = { opacity: 0 } as const;
const NOTE_REST = { opacity: 1 } as const;
const NOTE_FADE = { duration: 0.24, ease: 'easeOut' } as const;

const NOTE = { display: 'grid', minWidth: 0 } as const;

const notePaint = (quiet: boolean) =>
  ({
    gridArea: '1 / 1',
    m: 0,
    typography: 'body2',
    color: quiet ? 'text.secondary' : 'text.primary',
  }) as const;

interface KkStudioBManualNoteProps {
  noteKey: string;
  text: string;
  quiet: boolean;
}

export const KkStudioBManualNote: FC<KkStudioBManualNoteProps> = ({ noteKey, text, quiet }) => (
  <Box sx={NOTE}>
    <AnimatePresence initial={false} mode="popLayout">
      <Box
        key={noteKey}
        component={motion.p}
        initial={NOTE_ENTER}
        animate={NOTE_REST}
        exit={NOTE_ENTER}
        transition={NOTE_FADE}
        sx={notePaint(quiet)}
      >
        {text}
      </Box>
    </AnimatePresence>
  </Box>
);

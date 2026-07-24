import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useTheme } from '@mui/material/styles';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { FC } from 'react';
import { resolveGroupTint } from '@/features/club/groups-content';
import type { ActiveGroup } from '../logic/use-group-modal';
import { resolveModalTransition } from '../logic/use-group-modal';
import { useModalPresence } from '../logic/use-modal-presence';
import { GruppenModalPanel } from './GruppenModalPanel';

const MODAL_TITLE_ID = 'gruppen-modal-title';

interface GruppenModalProps {
  active: ActiveGroup | null;
  onClose: () => void;
}

export const GruppenModal: FC<GruppenModalProps> = ({ active, onClose }) => {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const { shown, isOpen, clear } = useModalPresence(active);

  const transition = resolveModalTransition(reducedMotion);
  const tint = shown === null ? undefined : resolveGroupTint(theme, shown.index);

  return (
    <Modal
      open={shown !== null}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: (t) => ({ backgroundColor: t.alpha(kkTokens.color.light.ink, 0.55) }),
        },
      }}
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-end', sm: 'center' },
        justifyContent: 'center',
        p: { xs: 0, sm: 3 },
      }}
    >
      <Box
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_TITLE_ID}
        tabIndex={-1}
        sx={{ display: 'flex', width: '100%', maxWidth: '34rem', outline: 'none' }}
      >
        <AnimatePresence onExitComplete={clear}>
          {isOpen && shown !== null && (
            <motion.div
              key={shown.group.title}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={transition}
              style={{ width: '100%' }}
            >
              <GruppenModalPanel
                group={shown.group}
                tint={tint}
                titleId={MODAL_TITLE_ID}
                onClose={onClose}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Modal>
  );
};

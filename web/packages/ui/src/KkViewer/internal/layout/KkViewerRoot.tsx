import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { KK_DARK_SCHEME_ATTRIBUTE } from '../../../theme';
import type {
  KkViewerEntrance,
  KkViewerItem,
  KkViewerKeys,
  KkViewerLabels,
} from '../../viewer-types';
import { useViewerRoot } from '../logic/use-viewer-root';
import { ViewerContext } from '../logic/viewer-context';
import { viewerEntranceOf } from '../logic/viewer-entrance';

const darkScheme = { [KK_DARK_SCHEME_ATTRIBUTE]: '' };
const BACKDROP_STYLE = { position: 'absolute', inset: 0, zIndex: -1 } as const;
const SURFACE_STYLE = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  isolation: 'isolate',
} as const;

interface KkViewerRootProps extends PropsWithChildren {
  items: readonly KkViewerItem[];
  index: number | null;
  labels: KkViewerLabels;
  keys?: KkViewerKeys;
  title?: string;
  entrance?: KkViewerEntrance;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  sx?: KkSx;
}

export const KkViewerRoot: FC<KkViewerRootProps> = ({
  items,
  index,
  labels,
  keys,
  title,
  entrance = 'fade',
  onIndexChange,
  onClose,
  sx,
  children,
}) => {
  const viewer = useViewerRoot({ items, index, labels, keys, onIndexChange, onClose });

  if (viewer.state === null) {
    return null;
  }

  const open = index !== null;
  const opening = viewerEntranceOf(entrance, viewer.reducedMotion);
  const dialogLabel = title ?? labels.dialog;

  return (
    <Modal open={open} onClose={onClose} hideBackdrop {...darkScheme} data-kk-viewer>
      <Fade in={open} timeout={opening.timeout}>
        <Stack
          role="dialog"
          aria-modal
          aria-label={dialogLabel}
          tabIndex={-1}
          onKeyDown={viewer.onKeyDown}
          sx={[
            {
              position: 'fixed',
              inset: 0,
              color: 'text.primary',
              outline: 'none',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <motion.div
            initial={opening.initial}
            animate={opening.opened}
            transition={opening.transition}
            style={SURFACE_STYLE}
          >
            <motion.div aria-hidden style={{ ...BACKDROP_STYLE, opacity: viewer.backdrop }}>
              <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'background.default' }} />
            </motion.div>
            <ViewerContext.Provider value={viewer.state}>{children}</ViewerContext.Provider>
          </motion.div>
        </Stack>
      </Fade>
    </Modal>
  );
};

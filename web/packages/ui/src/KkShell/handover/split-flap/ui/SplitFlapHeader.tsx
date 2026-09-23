import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { KkHandoverHeaderProps } from '../../../handover-stage';
import { useSplitFlapHeaderFold } from '../logic/use-split-flap-header-fold';

const HEADER_GAP = 1.25;
const FOLD_PERSPECTIVE = 900;

const FOLD_STYLE: CSSProperties = { minWidth: 0, pointerEvents: 'none' };

const HEADER_SX = { minWidth: 0, gap: HEADER_GAP, pointerEvents: 'none' } as const;

export const SplitFlapHeader: FC<KkHandoverHeaderProps> = ({ kind, children }) => {
  const fold = useSplitFlapHeaderFold();

  if (children === undefined || children === null) {
    return null;
  }

  if (kind === 'banner') {
    return (
      <Stack data-kk-shell-header sx={HEADER_SX}>
        {children}
      </Stack>
    );
  }

  return (
    <motion.div
      style={{
        ...FOLD_STYLE,
        originY: 0,
        transformPerspective: FOLD_PERSPECTIVE,
        rotateX: fold.rotateX,
        y: fold.y,
        scale: fold.scale,
        opacity: fold.opacity,
      }}
    >
      <Stack data-kk-shell-header sx={HEADER_SX}>
        {children}
      </Stack>
    </motion.div>
  );
};

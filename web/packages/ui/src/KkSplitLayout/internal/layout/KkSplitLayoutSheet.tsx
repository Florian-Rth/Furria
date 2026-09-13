import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { useSheetDrawer } from '../logic/use-sheet-drawer';
import { KkSplitLayoutSheetHandle } from '../ui/KkSplitLayoutSheetHandle';

const DRAG_ELASTIC = 0.04;
const MAX_SHEET_HEIGHT = '92dvh';
const SHEET_Z_INDEX = 1200;

const SHEET_STYLE: CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: SHEET_Z_INDEX,
};

interface KkSplitLayoutSheetProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkSplitLayoutSheet: FC<KkSplitLayoutSheetProps> = ({ sx, children }) => {
  const drawer = useSheetDrawer();
  const dragConstraints = { top: 0, bottom: drawer.travel };

  return (
    <motion.div
      ref={drawer.sheetRef}
      drag="y"
      dragListener={false}
      dragControls={drawer.dragControls}
      dragConstraints={dragConstraints}
      dragElastic={DRAG_ELASTIC}
      dragMomentum={false}
      onDragEnd={drawer.endDrag}
      style={{ ...SHEET_STYLE, y: drawer.y }}
    >
      <Stack
        component="section"
        sx={{
          maxHeight: MAX_SHEET_HEIGHT,
          borderTopLeftRadius: kkTokens.radius.base,
          borderTopRightRadius: kkTokens.radius.base,
          bgcolor: 'background.default',
          boxShadow: kkTokens.shadow.raised,
        }}
      >
        <KkSplitLayoutSheetHandle
          isOpen={drawer.isOpen}
          onToggle={drawer.toggle}
          onDragStart={drawer.startDrag}
        />
        <Stack
          data-kk-split-layout-pane
          sx={[
            { gap: kkTokens.layout.fieldGap, px: 3, pb: 4, overflowY: 'auto' },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          {children}
        </Stack>
      </Stack>
    </motion.div>
  );
};

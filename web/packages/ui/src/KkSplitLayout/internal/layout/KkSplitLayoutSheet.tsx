import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { useSheetReveal } from '../logic/use-sheet-reveal';

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
  const reveal = useSheetReveal();

  return (
    <motion.div ref={reveal.sheetRef} style={{ ...SHEET_STYLE, y: reveal.y }}>
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
        <Stack
          data-kk-split-layout-pane
          sx={[
            { gap: kkTokens.layout.fieldGap, px: 3, pt: 3, pb: 4, overflowY: 'auto' },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          {children}
        </Stack>
      </Stack>
    </motion.div>
  );
};

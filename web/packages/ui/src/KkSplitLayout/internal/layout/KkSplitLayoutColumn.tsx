import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const COLUMN_WIDTH = 'clamp(400px, 34vw, 480px)';

interface KkSplitLayoutColumnProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkSplitLayoutColumn: FC<KkSplitLayoutColumnProps> = ({ sx, children }) => (
  <Stack
    component="section"
    data-kk-split-layout-pane
    sx={[
      {
        position: 'relative',
        zIndex: 1,
        flex: `0 0 ${COLUMN_WIDTH}`,
        minWidth: 0,
        justifyContent: 'center',
        gap: kkTokens.layout.fieldGap,
        px: 5,
        py: 6,
        bgcolor: 'background.default',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

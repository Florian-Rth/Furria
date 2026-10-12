import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from '../../../internal/safe-area';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const BAR_TOP_ROOM = 8;

interface KkViewerBarProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkViewerBar: FC<KkViewerBarProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-viewer-bar
    sx={[
      {
        position: 'relative',
        alignItems: 'center',
        columnGap: 1,
        minWidth: 0,
        minHeight: kkTokens.shell.barHeight,
        px: 1,
        pt: safeArea('top', BAR_TOP_ROOM),
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

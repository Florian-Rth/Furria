import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from '../../../internal/safe-area';
import type { KkSx } from '../../../kk-sx';

const FOOT_BOTTOM_ROOM = 12;

interface KkViewerFootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkViewerFoot: FC<KkViewerFootProps> = ({ sx, children }) => (
  <Stack
    data-kk-viewer-foot
    sx={[
      { rowGap: 1, minWidth: 0, px: 1.5, pt: 1, pb: safeArea('bottom', FOOT_BOTTOM_ROOM) },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

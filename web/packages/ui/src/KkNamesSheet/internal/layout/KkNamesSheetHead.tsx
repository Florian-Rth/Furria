import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkNamesSheetHeadProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkNamesSheetHead: FC<KkNamesSheetHeadProps> = ({ sx, children }) => (
  <Stack
    data-kk-names-sheet-head
    sx={[
      { gap: 1.25, px: 2, pb: 1.5, flexShrink: 0, minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkStepPaneBodyProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkStepPaneBody: FC<KkStepPaneBodyProps> = ({ sx, children }) => (
  <Stack
    data-kk-step-pane-body
    sx={[{ gap: 2.5, minWidth: 0, pb: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);

import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

interface KkPanelStackProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkPanelStack: FC<KkPanelStackProps> = ({ sx, children }) => (
  <Stack
    data-kk-panel-stack
    sx={[{ gap: kkTokens.layout.panelGap, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);

import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkPanelStackDensity = 'regular' | 'dense';

const densityGaps: Record<KkPanelStackDensity, number> = {
  regular: kkTokens.layout.panelGap,
  dense: kkTokens.densePanel.gap,
};

interface KkPanelStackProps extends PropsWithChildren {
  density?: KkPanelStackDensity;
  sx?: KkSx;
}

export const KkPanelStack: FC<KkPanelStackProps> = ({ density = 'regular', sx, children }) => (
  <Stack
    data-kk-panel-stack
    sx={[{ gap: densityGaps[density], minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);

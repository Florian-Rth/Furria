import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkPanelStackDensity = 'regular' | 'dense';

const densityFrames: Record<KkPanelStackDensity, CSSObject> = {
  regular: { gap: kkTokens.layout.panelGap, minWidth: 0 },
  dense: { gap: kkTokens.densePanel.gap, minWidth: 0, maxWidth: kkTokens.measure.lead },
};

interface KkPanelStackProps extends PropsWithChildren {
  density?: KkPanelStackDensity;
  sx?: KkSx;
}

export const KkPanelStack: FC<KkPanelStackProps> = ({ density = 'regular', sx, children }) => (
  <Stack data-kk-panel-stack sx={[densityFrames[density], ...(Array.isArray(sx) ? sx : [sx])]}>
    {children}
  </Stack>
);

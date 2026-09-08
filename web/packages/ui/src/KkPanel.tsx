import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkPanelVariant = 'list' | 'block';

const PANEL_BORDER = 1.5;

const panelPadding: Record<KkPanelVariant, { px: number; py: number }> = {
  list: { px: 2, py: 0.5 },
  block: { px: 2, py: 1.75 },
};

interface KkPanelProps extends PropsWithChildren {
  variant?: KkPanelVariant;
  sx?: KkSx;
}

export const KkPanel: FC<KkPanelProps> = ({ variant = 'list', sx, children }) => (
  <Stack
    data-kk-panel
    sx={[
      {
        minWidth: 0,
        bgcolor: 'background.paper',
        border: PANEL_BORDER,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.card}px`,
        ...panelPadding[variant],
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

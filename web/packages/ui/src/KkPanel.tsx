import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkPanelVariant = 'list' | 'block';
type KkPanelTone = 'cream' | 'raised' | 'reserved';

const PANEL_BORDER = 1.5;
const DIMMED_OPACITY = 0.72;

const panelPadding: Record<KkPanelVariant, { px: number; py: number }> = {
  list: { px: 2, py: 0.5 },
  block: { px: 2, py: 1.75 },
};

const raisedSurface = (theme: Theme): CSSObject => ({
  backgroundColor: kkTokens.color.light.panel2,
  ...theme.applyStyles('dark', { backgroundColor: kkTokens.color.dark.panel2 }),
});

const toneStyles: Record<KkPanelTone, (theme: Theme) => CSSObject> = {
  cream: () => ({ backgroundColor: 'background.paper', borderStyle: 'solid' }),
  raised: (theme) => ({ ...raisedSurface(theme), borderStyle: 'solid' }),
  reserved: (theme) => ({ ...raisedSurface(theme), borderStyle: 'dashed' }),
};

interface KkPanelProps extends PropsWithChildren {
  variant?: KkPanelVariant;
  tone?: KkPanelTone;
  dimmed?: boolean;
  sx?: KkSx;
}

export const KkPanel: FC<KkPanelProps> = ({
  variant = 'list',
  tone = 'cream',
  dimmed = false,
  sx,
  children,
}) => (
  <Stack
    data-kk-panel
    sx={[
      (theme) => ({
        minWidth: 0,
        border: PANEL_BORDER,
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.card}px`,
        opacity: dimmed ? DIMMED_OPACITY : 1,
        ...toneStyles[tone](theme),
        ...panelPadding[variant],
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

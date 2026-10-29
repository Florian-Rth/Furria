import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from '../internal/safe-area';
import { trackEdgeOf } from '../KkShell/internal/track-edge';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

const DECK_LAYER = 3;

interface KkStudioADeckProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkStudioADeck: FC<KkStudioADeckProps> = ({ label, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-studio-a-deck
    sx={[
      (theme) => ({
        position: 'sticky',
        top: trackEdgeOf('top'),
        bottom: safeArea('bottom', kkTokens.shell.gutter),
        zIndex: DECK_LAYER,
        gap: 1.25,
        px: 1.5,
        pt: 1.25,
        pb: 1.5,
        minWidth: 0,
        borderRadius: `${kkTokens.radius.base + 4}px`,
        backgroundColor: (theme.vars ?? theme).palette.background.paper,
        border: `${kkTokens.line.hair}px solid ${(theme.vars ?? theme).palette.divider}`,
        boxShadow: kkTokens.shadow.raised,
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

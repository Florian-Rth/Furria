import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';

export const STICKY_ACTION_BAR_HEIGHT = '4.5rem';

export const STICKY_ACTION_BAR_STACKED_HEIGHT = {
  xs: '9rem',
  sm: STICKY_ACTION_BAR_HEIGHT,
};

interface StickyActionBarProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
}

export const StickyActionBar: FC<StickyActionBarProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-sticky-action-bar
    sx={[
      (theme) => ({
        position: 'sticky',
        bottom: 0,
        marginTop: 'auto',
        zIndex: theme.zIndex.appBar,
        alignItems: 'center',
        gap: 2,
        minHeight: STICKY_ACTION_BAR_HEIGHT,
        px: kkTokens.layout.gutterX,
        py: 1.5,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)',
        borderTop: kkTokens.line.hair,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: kkTokens.shadow.raised,
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

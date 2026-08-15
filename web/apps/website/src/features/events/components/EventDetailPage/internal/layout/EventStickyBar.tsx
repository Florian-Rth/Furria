import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const EVENT_STICKY_BAR_HEIGHT = '4.5rem';

export const EventStickyBar: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-event-sticky-cta
    sx={(theme) => ({
      display: { desktop: 'none' },
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: theme.zIndex.appBar,
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      minHeight: EVENT_STICKY_BAR_HEIGHT,
      px: kkTokens.layout.gutterX,
      py: 1.5,
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)',
      borderTop: kkTokens.line.hair,
      borderColor: 'divider',
      bgcolor: 'background.paper',
      boxShadow: kkTokens.shadow.raised,
    })}
  >
    {children}
  </Stack>
);

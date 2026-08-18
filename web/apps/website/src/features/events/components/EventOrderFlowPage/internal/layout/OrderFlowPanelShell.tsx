import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const OrderFlowPanelShell: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-order-flow-panel
    sx={{
      gap: 1.5,
      p: { xs: 3, md: 4 },
      borderWidth: kkTokens.line.hair,
      borderStyle: 'dashed',
      borderColor: 'divider',
      borderRadius: `${kkTokens.radius.base}px`,
    }}
  >
    {children}
  </Stack>
);

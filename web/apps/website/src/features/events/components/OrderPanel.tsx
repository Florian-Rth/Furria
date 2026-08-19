import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';

type OrderPanelTone = 'content' | 'placeholder';

interface OrderPanelProps extends PropsWithChildren {
  tone: OrderPanelTone;
  sx?: SxProps<Theme>;
}

const BORDER_STYLE_BY_TONE: Record<OrderPanelTone, string> = {
  content: 'solid',
  placeholder: 'dashed',
};

export const OrderPanel: FC<OrderPanelProps> = ({ tone, sx, children }) => (
  <Stack
    data-kk-order-panel
    data-kk-order-panel-tone={tone}
    sx={[
      {
        p: { xs: 3, md: 4 },
        borderWidth: kkTokens.line.hair,
        borderStyle: BORDER_STYLE_BY_TONE[tone],
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

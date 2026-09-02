import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const EventsFaqList: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-events-faq-list
    sx={{
      maxWidth: '52rem',
      borderBottom: `${kkTokens.line.hair}px solid`,
      borderColor: 'divider',
    }}
  >
    {children}
  </Stack>
);

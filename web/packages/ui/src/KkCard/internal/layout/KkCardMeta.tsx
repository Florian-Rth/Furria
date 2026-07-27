import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkCardMeta: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-card-meta
    sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}
  >
    {children}
  </Stack>
);

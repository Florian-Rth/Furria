import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KompassChoiceRow: FC<PropsWithChildren> = ({ children }) => (
  <Stack direction="row" sx={{ gap: { xs: 1.5, md: 2 }, flexWrap: 'wrap' }}>
    {children}
  </Stack>
);

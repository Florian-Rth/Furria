import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const ApplyThanksHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-apply-thanks-head
    direction={{ xs: 'column-reverse', sm: 'row' }}
    sx={{
      gap: { xs: 2, md: 3 },
      alignItems: { xs: 'flex-start', sm: 'center' },
      justifyContent: 'space-between',
    }}
  >
    {children}
  </Stack>
);

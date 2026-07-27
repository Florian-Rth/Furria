import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkCardFooter: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-card-footer
    sx={{
      width: '100%',
      mt: 'auto',
      pt: 1,
      gap: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    {children}
  </Stack>
);

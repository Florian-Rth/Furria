import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkBrandStageBrand: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-brand-stage-brand
    sx={{
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 2,
      py: 4,
    }}
  >
    {children}
  </Stack>
);

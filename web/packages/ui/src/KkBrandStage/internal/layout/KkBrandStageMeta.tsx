import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkBrandStageMeta: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-brand-stage-meta
    sx={{
      width: '100%',
      gap: 2,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      flexShrink: 0,
    }}
  >
    {children}
  </Stack>
);

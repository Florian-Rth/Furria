import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkSessionRowHeading: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-session-row-heading
    sx={{
      alignItems: 'center',
      justifyContent: 'space-between',
      columnGap: 1,
      rowGap: 0.5,
      flexWrap: 'wrap',
      minWidth: 0,
    }}
  >
    {children}
  </Stack>
);

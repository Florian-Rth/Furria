import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkLaneInspectorTop: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    sx={{
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 1,
      minWidth: 0,
      '& > :not([data-kk-lane-inspector-close])': { flex: 1 },
    }}
  >
    {children}
  </Stack>
);

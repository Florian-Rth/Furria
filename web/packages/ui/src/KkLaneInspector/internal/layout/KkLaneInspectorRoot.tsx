import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkLaneInspectorRoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-lane-inspector
    sx={{
      minHeight: 0,
      minWidth: 0,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      p: 1.5,
      gap: 1.5,
    }}
  >
    {children}
  </Stack>
);

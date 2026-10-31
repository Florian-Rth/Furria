import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkLaneBarRootProps extends PropsWithChildren {
  label: string;
}

export const KkLaneBarRoot: FC<KkLaneBarRootProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="toolbar"
    aria-label={label}
    data-kk-lane-bar
    sx={{
      alignItems: 'center',
      gap: 1,
      minWidth: 0,
      minHeight: '2.75rem',
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}
  >
    {children}
  </Stack>
);

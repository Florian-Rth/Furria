import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkLaneBarGroupProps extends PropsWithChildren {
  label: string;
  grow?: boolean;
}

export const KkLaneBarGroup: FC<KkLaneBarGroupProps> = ({ label, grow = false, children }) => (
  <Stack
    direction="row"
    role="group"
    aria-label={label}
    sx={{
      alignItems: 'center',
      gap: 0.5,
      flexShrink: 0,
      flexGrow: grow ? 1 : 0,
    }}
  >
    {children}
  </Stack>
);

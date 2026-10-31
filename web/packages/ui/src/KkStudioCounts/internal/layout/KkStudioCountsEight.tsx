import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioCountsEightProps extends PropsWithChildren {
  grow: number;
}

export const KkStudioCountsEight: FC<KkStudioCountsEightProps> = ({ grow, children }) => (
  <Stack
    direction="row"
    style={{ flexGrow: grow }}
    sx={{ flexBasis: 0, minWidth: 0, gap: '2px', alignItems: 'flex-end', pointerEvents: 'none' }}
  >
    {children}
  </Stack>
);

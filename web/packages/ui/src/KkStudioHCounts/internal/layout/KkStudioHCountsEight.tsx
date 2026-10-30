import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioHCountsEightProps extends PropsWithChildren {
  grow: number;
}

export const KkStudioHCountsEight: FC<KkStudioHCountsEightProps> = ({ grow, children }) => (
  <Stack
    direction="row"
    style={{ flexGrow: grow }}
    sx={{ flexBasis: 0, minWidth: 0, gap: '2px', alignItems: 'flex-end', pointerEvents: 'none' }}
  >
    {children}
  </Stack>
);

import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioESegmentsGroupProps extends PropsWithChildren {
  grow: number;
}

export const KkStudioESegmentsGroup: FC<KkStudioESegmentsGroupProps> = ({ grow, children }) => (
  <Stack style={{ flexGrow: grow }} sx={{ flexBasis: 0, minWidth: 0, gap: 0.25 }}>
    {children}
  </Stack>
);

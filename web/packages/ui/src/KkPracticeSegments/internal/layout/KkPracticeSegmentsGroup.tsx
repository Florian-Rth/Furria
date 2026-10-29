import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkPracticeSegmentsGroupProps extends PropsWithChildren {
  grow: number;
}

export const KkPracticeSegmentsGroup: FC<KkPracticeSegmentsGroupProps> = ({ grow, children }) => (
  <Stack style={{ flexGrow: grow }} sx={{ flexBasis: 0, minWidth: 0, gap: 0.25 }}>
    {children}
  </Stack>
);

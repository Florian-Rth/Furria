import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkPracticeSegmentsGroupProps extends PropsWithChildren {
  grow: number;
}

export const KkPracticeSegmentsGroup: FC<KkPracticeSegmentsGroupProps> = ({ grow, children }) => (
  <Stack
    direction="row"
    style={{ flexGrow: grow }}
    sx={{ flexShrink: 0, flexBasis: 'auto', minWidth: 0, gap: '0.1875rem' }}
  >
    {children}
  </Stack>
);

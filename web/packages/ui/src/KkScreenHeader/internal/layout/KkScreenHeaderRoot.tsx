import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export type KkScreenHeaderAlign = 'center' | 'start' | 'stretch';

const ALIGNMENTS: Record<KkScreenHeaderAlign, 'center' | 'flex-start' | 'stretch'> = {
  center: 'center',
  start: 'flex-start',
  stretch: 'stretch',
};

interface KkScreenHeaderRootProps extends PropsWithChildren {
  align?: KkScreenHeaderAlign;
}

export const KkScreenHeaderRoot: FC<KkScreenHeaderRootProps> = ({ align = 'center', children }) => (
  <Stack
    direction="row"
    data-kk-screen-header
    sx={{ alignItems: ALIGNMENTS[align], gap: 1.75, minWidth: 0 }}
  >
    {children}
  </Stack>
);

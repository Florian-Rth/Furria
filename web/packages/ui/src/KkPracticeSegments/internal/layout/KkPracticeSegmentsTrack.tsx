import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkPracticeSegmentsTrack: FC<PropsWithChildren> = ({ children }) => (
  <Stack direction="row" sx={{ minWidth: 0, gap: '0.1875rem' }}>
    {children}
  </Stack>
);

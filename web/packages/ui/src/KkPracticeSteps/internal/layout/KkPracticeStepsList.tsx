import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkPracticeStepsList: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-practice-steps-list
    sx={{
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      px: 1,
      pb: 1.5,
      gap: 1.5,
    }}
  >
    {children}
  </Stack>
);

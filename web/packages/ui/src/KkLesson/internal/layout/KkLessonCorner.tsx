import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkLessonCorner: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-lesson-corner
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 3,
      p: 0.75,
      gap: 0.5,
      alignItems: 'center',
    }}
  >
    {children}
  </Stack>
);

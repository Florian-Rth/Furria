import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioFLessonFoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-studio-f-foot
    sx={{ flexShrink: 0, minWidth: 0, gap: { xs: 1.5, desktop: 2 }, pb: { xs: 0.5, desktop: 1 } }}
  >
    {children}
  </Stack>
);

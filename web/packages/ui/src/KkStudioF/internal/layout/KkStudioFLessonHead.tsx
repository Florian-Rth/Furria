import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioFLessonHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-studio-f-head sx={{ flexShrink: 0, minWidth: 0, gap: 0.25 }}>
    {children}
  </Stack>
);

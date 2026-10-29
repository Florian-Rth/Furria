import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioFLessonMedia: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-studio-f-media sx={{ position: 'relative', flex: 1, minHeight: 0, minWidth: 0 }}>
    {children}
  </Box>
);

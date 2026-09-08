import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const BAR_WIDTH = 17;
const BAR_HEIGHT = 2.4;

export const KkAppShellMenuMark: FC = () => (
  <Stack aria-hidden data-kk-app-shell-menu-mark sx={{ gap: '3.5px', flexShrink: 0 }}>
    <Box sx={{ width: BAR_WIDTH, height: BAR_HEIGHT, bgcolor: 'primary.main' }} />
    <Box sx={{ width: BAR_WIDTH, height: BAR_HEIGHT, bgcolor: 'text.primary' }} />
    <Box sx={{ width: BAR_WIDTH, height: BAR_HEIGHT, bgcolor: 'text.primary' }} />
  </Stack>
);

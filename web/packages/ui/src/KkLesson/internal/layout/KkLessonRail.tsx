import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkLessonRailProps extends PropsWithChildren {
  label: string;
}

export const KkLessonRail: FC<KkLessonRailProps> = ({ label, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-lesson-rail
    sx={{
      width: '100%',
      minWidth: 0,
      overflowX: 'auto',
      overflowY: 'clip',
      overscrollBehaviorX: 'contain',
      scrollbarWidth: 'none',
      py: 0.5,
      '&::-webkit-scrollbar': { display: 'none' },
    }}
  >
    <Stack direction="row" sx={{ width: 'max-content', minWidth: '100%', gap: 1.5, px: 0.25 }}>
      {children}
    </Stack>
  </Box>
);

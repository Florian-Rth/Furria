import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

const RAIL_FADE_START = '1rem';
const RAIL_FADE_END = '3.5rem';
const RAIL_FADE = `linear-gradient(to right, transparent, black ${RAIL_FADE_START}, black calc(100% - ${RAIL_FADE_END}), transparent)`;

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
      maskImage: RAIL_FADE,
      WebkitMaskImage: RAIL_FADE,
      '&::-webkit-scrollbar': { display: 'none' },
    }}
  >
    <Stack
      direction="row"
      sx={{
        width: 'max-content',
        minWidth: '100%',
        gap: 1.5,
        pl: RAIL_FADE_START,
        pr: RAIL_FADE_END,
      }}
    >
      {children}
    </Stack>
  </Box>
);

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface AppSkeletonRegionProps extends PropsWithChildren {
  label: string;
  gap?: number;
}

const DEFAULT_GAP = 3;

const VISUALLY_HIDDEN = {
  position: 'absolute',
  width: 1,
  height: 1,
  p: 0,
  m: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

export const AppSkeletonRegion: FC<AppSkeletonRegionProps> = ({
  label,
  gap = DEFAULT_GAP,
  children,
}) => (
  <Stack role="status" aria-busy sx={{ gap, minWidth: 0 }}>
    <Box component="span" sx={VISUALLY_HIDDEN}>
      {label}
    </Box>
    {children}
  </Stack>
);

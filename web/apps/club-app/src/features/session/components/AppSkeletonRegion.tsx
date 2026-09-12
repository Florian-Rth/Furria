import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface AppSkeletonRegionProps extends PropsWithChildren {
  label: string;
  gap?: number;
}

const DEFAULT_GAP = 3;

export const AppSkeletonRegion: FC<AppSkeletonRegionProps> = ({
  label,
  gap = DEFAULT_GAP,
  children,
}) => (
  <Stack role="status" aria-busy aria-label={label} sx={{ gap, minWidth: 0 }}>
    {children}
  </Stack>
);

import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioESegmentsRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioESegmentsRoot: FC<KkStudioESegmentsRootProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="group"
    aria-label={label}
    data-kk-studio-e-segments
    sx={{ width: '100%', minWidth: 0, gap: { xs: 1, desktop: 1.25 } }}
  >
    {children}
  </Stack>
);

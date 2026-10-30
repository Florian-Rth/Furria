import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioHPlacementRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioHPlacementRoot: FC<KkStudioHPlacementRootProps> = ({ label, children }) => (
  <Stack
    role="group"
    aria-label={label}
    data-kk-studio-h-placement
    sx={{ width: '100%', minWidth: 0, gap: 0.5 }}
  >
    {children}
  </Stack>
);

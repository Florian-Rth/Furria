import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioPlacementRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioPlacementRoot: FC<KkStudioPlacementRootProps> = ({ label, children }) => (
  <Stack
    role="group"
    aria-label={label}
    data-kk-studio-placement
    sx={{ width: '100%', minWidth: 0, gap: 0.5 }}
  >
    {children}
  </Stack>
);

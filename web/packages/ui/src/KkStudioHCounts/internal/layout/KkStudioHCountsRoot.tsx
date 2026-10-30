import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioHCountsRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioHCountsRoot: FC<KkStudioHCountsRootProps> = ({ label, children }) => (
  <Stack
    role="group"
    aria-label={label}
    data-kk-studio-h-counts
    sx={{ width: '100%', minWidth: 0, gap: 0.5 }}
  >
    {children}
  </Stack>
);

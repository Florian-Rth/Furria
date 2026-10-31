import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioCountsRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioCountsRoot: FC<KkStudioCountsRootProps> = ({ label, children }) => (
  <Stack
    role="group"
    aria-label={label}
    data-kk-studio-counts
    sx={{ width: '100%', minWidth: 0, gap: 0.5 }}
  >
    {children}
  </Stack>
);

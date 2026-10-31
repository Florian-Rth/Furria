import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioDeskRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioDeskRoot: FC<KkStudioDeskRootProps> = ({ label, children }) => (
  <Stack role="group" aria-label={label} data-kk-studio-desk sx={{ gap: 1.5, px: 1, py: 1 }}>
    {children}
  </Stack>
);

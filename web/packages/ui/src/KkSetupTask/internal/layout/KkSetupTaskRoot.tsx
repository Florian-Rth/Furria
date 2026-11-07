import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkSetupTaskRootProps extends PropsWithChildren {
  label: string;
}

export const KkSetupTaskRoot: FC<KkSetupTaskRootProps> = ({ label, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-setup-task
    sx={{ minWidth: 0, minHeight: 0, height: '100%', gap: 1 }}
  >
    {children}
  </Stack>
);

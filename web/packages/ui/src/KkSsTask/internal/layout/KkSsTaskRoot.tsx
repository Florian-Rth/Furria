import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkSsTaskRootProps extends PropsWithChildren {
  label: string;
}

export const KkSsTaskRoot: FC<KkSsTaskRootProps> = ({ label, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-ss-task
    sx={{ minWidth: 0, minHeight: 0, height: '100%', gap: 1 }}
  >
    {children}
  </Stack>
);

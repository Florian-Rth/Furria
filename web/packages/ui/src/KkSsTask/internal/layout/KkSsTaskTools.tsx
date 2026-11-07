import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkSsTaskToolsProps extends PropsWithChildren {
  label: string;
}

export const KkSsTaskTools: FC<KkSsTaskToolsProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="group"
    aria-label={label}
    data-kk-ss-task-tools
    sx={{ flexShrink: 0, flexWrap: 'wrap', alignItems: 'center', gap: 1, minWidth: 0 }}
  >
    {children}
  </Stack>
);

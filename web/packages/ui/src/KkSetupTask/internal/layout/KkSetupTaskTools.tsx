import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkSetupTaskToolsProps extends PropsWithChildren {
  label: string;
}

export const KkSetupTaskTools: FC<KkSetupTaskToolsProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="group"
    aria-label={label}
    data-kk-setup-task-tools
    sx={{ flexShrink: 0, flexWrap: 'wrap', alignItems: 'center', gap: 1, minWidth: 0 }}
  >
    {children}
  </Stack>
);

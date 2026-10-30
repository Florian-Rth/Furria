import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkLaneInspectorActionsProps extends PropsWithChildren {
  label: string;
}

export const KkLaneInspectorActions: FC<KkLaneInspectorActionsProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="group"
    aria-label={label}
    sx={{ flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}
  >
    {children}
  </Stack>
);

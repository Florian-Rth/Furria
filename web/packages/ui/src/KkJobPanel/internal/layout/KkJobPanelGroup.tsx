import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkJobPanelGroupProps extends PropsWithChildren {
  label: string;
}

export const KkJobPanelGroup: FC<KkJobPanelGroupProps> = ({ label, children }) => (
  <Stack role="group" aria-label={label} sx={{ minWidth: 0, gap: 0.5 }}>
    {children}
  </Stack>
);

import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkJobPanelRootProps extends PropsWithChildren {
  label: string;
}

export const KkJobPanelRoot: FC<KkJobPanelRootProps> = ({ label, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-job-panel
    sx={{
      minHeight: 0,
      minWidth: 0,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      gap: 1.25,
    }}
  >
    {children}
  </Stack>
);

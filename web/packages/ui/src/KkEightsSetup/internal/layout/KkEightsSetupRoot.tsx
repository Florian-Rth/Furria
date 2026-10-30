import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkEightsSetupRootProps extends PropsWithChildren {
  label: string;
}

export const KkEightsSetupRoot: FC<KkEightsSetupRootProps> = ({ label, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-eights-setup
    sx={{
      gap: 1.5,
      minWidth: 0,
      minHeight: 0,
      width: '100%',
      maxWidth: '44rem',
      mx: 'auto',
      overflowY: 'auto',
    }}
  >
    {children}
  </Stack>
);

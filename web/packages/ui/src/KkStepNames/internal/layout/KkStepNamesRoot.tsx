import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStepNamesRootProps extends PropsWithChildren {
  label: string;
}

export const KkStepNamesRoot: FC<KkStepNamesRootProps> = ({ label, children }) => (
  <Stack
    component="ol"
    aria-label={label}
    data-kk-step-names
    sx={{ m: 0, p: 0, listStyle: 'none', minWidth: 0, gap: 0.5 }}
  >
    {children}
  </Stack>
);

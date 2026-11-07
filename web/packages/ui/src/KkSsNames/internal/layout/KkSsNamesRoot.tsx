import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkSsNamesRootProps extends PropsWithChildren {
  label: string;
}

export const KkSsNamesRoot: FC<KkSsNamesRootProps> = ({ label, children }) => (
  <Stack
    component="ol"
    aria-label={label}
    data-kk-ss-names
    sx={{ m: 0, p: 0, listStyle: 'none', minWidth: 0, gap: 0.5 }}
  >
    {children}
  </Stack>
);

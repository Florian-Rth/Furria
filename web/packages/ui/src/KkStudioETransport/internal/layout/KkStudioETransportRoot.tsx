import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioETransportRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioETransportRoot: FC<KkStudioETransportRootProps> = ({ label, children }) => (
  <Stack
    role="group"
    aria-label={label}
    data-kk-studio-e-transport
    sx={{ gap: { xs: 1, desktop: 1.5 }, minWidth: 0 }}
  >
    {children}
  </Stack>
);

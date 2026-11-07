import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface SsTransportGroupProps extends PropsWithChildren {
  label: string;
}

export const SsTransportGroup: FC<SsTransportGroupProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="group"
    aria-label={label}
    sx={{ alignItems: 'center', gap: 1, flexShrink: 0 }}
  >
    {children}
  </Stack>
);

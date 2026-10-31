import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkPracticeTransportRootProps extends PropsWithChildren {
  label: string;
}

export const KkPracticeTransportRoot: FC<KkPracticeTransportRootProps> = ({ label, children }) => (
  <Stack
    role="group"
    aria-label={label}
    data-kk-practice-transport
    sx={{ gap: { xs: 1, desktop: 1.5 }, minWidth: 0 }}
  >
    {children}
  </Stack>
);

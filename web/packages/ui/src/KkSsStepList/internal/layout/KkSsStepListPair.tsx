import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkSsStepListPairProps extends PropsWithChildren {
  label: string;
}

export const KkSsStepListPair: FC<KkSsStepListPairProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="img"
    aria-label={label}
    sx={{ flexShrink: 0, alignItems: 'center', gap: 0.25, width: '5.5rem' }}
  >
    {children}
  </Stack>
);

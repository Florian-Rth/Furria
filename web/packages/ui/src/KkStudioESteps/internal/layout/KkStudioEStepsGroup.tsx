import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioEStepsGroupProps extends PropsWithChildren {
  label: string;
}

export const KkStudioEStepsGroup: FC<KkStudioEStepsGroupProps> = ({ label, children }) => (
  <Stack component="section" aria-label={label} sx={{ gap: 0.25 }}>
    {children}
  </Stack>
);

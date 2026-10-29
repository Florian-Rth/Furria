import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkPracticeStepsGroupProps extends PropsWithChildren {
  label: string;
}

export const KkPracticeStepsGroup: FC<KkPracticeStepsGroupProps> = ({ label, children }) => (
  <Stack component="section" aria-label={label} sx={{ gap: 0.25 }}>
    {children}
  </Stack>
);

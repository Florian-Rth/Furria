import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkPracticeStepsPanelProps extends PropsWithChildren {
  label: string;
}

export const KkPracticeStepsPanel: FC<KkPracticeStepsPanelProps> = ({ label, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-practice-steps-panel
    sx={{ height: '100%', minHeight: 0, pt: 1 }}
  >
    {children}
  </Stack>
);

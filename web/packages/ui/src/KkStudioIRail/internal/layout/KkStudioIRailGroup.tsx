import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioIRailGroupProps extends PropsWithChildren {
  label: string;
}

export const KkStudioIRailGroup: FC<KkStudioIRailGroupProps> = ({ label, children }) => (
  <Stack component="section" aria-label={label} sx={{ gap: 0.5, flexShrink: 0, minWidth: 0 }}>
    {children}
  </Stack>
);

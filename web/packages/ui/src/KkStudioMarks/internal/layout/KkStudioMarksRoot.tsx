import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioMarksRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioMarksRoot: FC<KkStudioMarksRootProps> = ({ label, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-studio-marks
    data-kk-studio-track
    sx={{ position: 'relative', width: '100%', height: '3.5rem', flexShrink: 0 }}
  >
    {children}
  </Box>
);

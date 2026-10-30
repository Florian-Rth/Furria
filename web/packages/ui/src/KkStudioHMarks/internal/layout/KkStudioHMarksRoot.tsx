import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioHMarksRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioHMarksRoot: FC<KkStudioHMarksRootProps> = ({ label, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-studio-h-marks
    data-kk-studio-h-track
    sx={{ position: 'relative', width: '100%', height: '3.5rem', flexShrink: 0 }}
  >
    {children}
  </Box>
);

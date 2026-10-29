import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkStudioCViewRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkStudioCViewRoot: FC<KkStudioCViewRootProps> = ({ label, sx, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-studio-c-view
    sx={[{ position: 'relative', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Box>
);

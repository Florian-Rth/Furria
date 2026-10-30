import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioGTransportRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioGTransportRoot: FC<KkStudioGTransportRootProps> = ({ label, children }) => (
  <Box
    role="toolbar"
    aria-label={label}
    data-kk-studio-g-transport
    sx={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
      alignItems: 'center',
      columnGap: 1,
      minWidth: 0,
    }}
  >
    {children}
  </Box>
);

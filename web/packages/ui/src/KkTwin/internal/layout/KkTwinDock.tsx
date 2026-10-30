import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { TWIN_TIGHT, TWIN_TIGHT_GAP, TWIN_WIDE } from '../twin-query';

interface KkTwinDockProps extends PropsWithChildren {
  label: string;
}

export const KkTwinDock: FC<KkTwinDockProps> = ({ label, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-twin-dock
    sx={{
      gridArea: 'dock',
      display: 'grid',
      minWidth: 0,
      gridTemplateAreas: '"rail" "keys"',
      gridTemplateColumns: 'minmax(0, 1fr)',
      rowGap: 1,
      [TWIN_WIDE]: {
        gridTemplateAreas: '"keys rail"',
        gridTemplateColumns: 'auto minmax(0, 1fr)',
        columnGap: 1.5,
      },
      [TWIN_TIGHT]: { rowGap: TWIN_TIGHT_GAP },
    }}
  >
    {children}
  </Box>
);

import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export type KkLanePhoneAreaName = 'band' | 'head' | 'cards' | 'transport';

interface KkLanePhoneAreaProps extends PropsWithChildren {
  area: KkLanePhoneAreaName;
}

export const KkLanePhoneArea: FC<KkLanePhoneAreaProps> = ({ area, children }) => (
  <Box
    data-kk-lane-phone-area={area}
    sx={{
      gridArea: area,
      minWidth: 0,
      minHeight: 0,
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'minmax(0, 1fr)',
    }}
  >
    {children}
  </Box>
);

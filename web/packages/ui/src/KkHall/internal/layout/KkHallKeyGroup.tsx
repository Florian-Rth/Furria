import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { HALL_CRAMPED_NARROW } from '../hall-query';

const KEY_ROW_HEIGHT = '4.25rem';

interface KkHallKeyGroupProps extends PropsWithChildren {
  label: string;
}

export const KkHallKeyGroup: FC<KkHallKeyGroupProps> = ({ label, children }) => (
  <Box
    role="group"
    aria-label={label}
    sx={{
      display: 'grid',
      gridAutoFlow: 'column',
      gridAutoColumns: 'minmax(0, 1fr)',
      gap: { xs: 1, desktop: 1.5 },
      width: '100%',
      height: '100%',
      minHeight: KEY_ROW_HEIGHT,
      [HALL_CRAMPED_NARROW]: {
        gridAutoFlow: 'row',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      },
    }}
  >
    {children}
  </Box>
);

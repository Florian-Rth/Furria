import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkTimetableRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkTimetableRoot: FC<KkTimetableRootProps> = ({ label, sx, children }) => (
  <Stack
    component="ul"
    aria-label={label}
    data-kk-timetable
    sx={[{ m: 0, p: 0, listStyle: 'none', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);

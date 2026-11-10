import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkDayScheduleRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkDayScheduleRoot: FC<KkDayScheduleRootProps> = ({ label, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-day-schedule
    sx={[{ gap: 1, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);

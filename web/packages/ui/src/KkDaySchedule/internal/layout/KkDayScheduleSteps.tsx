import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkDayScheduleStepsProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkDayScheduleSteps: FC<KkDayScheduleStepsProps> = ({ label, sx, children }) => (
  <Stack
    component="ol"
    aria-label={label}
    data-kk-day-schedule-steps
    sx={[{ minWidth: 0, m: 0, p: 0, listStyle: 'none' }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);

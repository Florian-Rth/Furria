import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../../../kk-sx';

export type KkDayScheduleHeading = 'h3' | 'h4' | 'h5';

interface KkDayScheduleHeadProps {
  title: string;
  heading?: KkDayScheduleHeading;
  sx?: KkSx;
}

export const KkDayScheduleHead: FC<KkDayScheduleHeadProps> = ({ title, heading = 'h4', sx }) => (
  <Typography
    component={heading}
    variant="body1"
    data-kk-day-schedule-head
    sx={[
      { fontWeight: 800, lineHeight: 1.3, m: 0, overflowWrap: 'anywhere' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {title}
  </Typography>
);

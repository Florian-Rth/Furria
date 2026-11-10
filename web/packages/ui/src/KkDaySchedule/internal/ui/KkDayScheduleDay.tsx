import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import type { KkDayScheduleHeading } from './KkDayScheduleHead';

interface KkDayScheduleDayProps {
  label: string;
  heading?: KkDayScheduleHeading;
  sx?: KkSx;
}

export const KkDayScheduleDay: FC<KkDayScheduleDayProps> = ({ label, heading = 'h5', sx }) => (
  <Typography
    component={heading}
    variant="overline"
    data-kk-day-schedule-day
    sx={[
      { ...kkTokens.eyebrow, m: 0, color: 'text.secondary' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {label}
  </Typography>
);

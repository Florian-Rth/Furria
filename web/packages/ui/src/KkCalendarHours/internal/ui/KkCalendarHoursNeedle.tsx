import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { useCalendarHours } from '../logic/calendar-hours-context';
import { hoursShareOf } from '../logic/calendar-hours-geometry';

const { calendarHours } = kkTokens;
const PERCENT = 100;
const SWEEP_DELAY = 0.25;
const OUTSIDE = -1;

interface KkCalendarHoursNeedleProps {
  minute: number;
  label: string;
}

export const KkCalendarHoursNeedle: FC<KkCalendarHoursNeedleProps> = ({ minute, label }) => {
  const { axis, reduced } = useCalendarHours();
  const share = hoursShareOf(minute, axis);
  const inside = minute >= axis.startHour * 60 && minute <= axis.endHour * 60;
  const at = { left: `${share * PERCENT}%`, opacity: inside ? 1 : 0 };
  const from = reduced ? at : { left: '0%', opacity: inside ? 1 : 0 };

  return (
    <Box
      role="img"
      aria-label={label}
      data-kk-calendar-hours-needle={inside ? minute : OUTSIDE}
      component={motion.div}
      initial={from}
      animate={at}
      transition={{
        duration: reduced ? 0 : calendarHours.needleSeconds,
        ease: [0.22, 0.61, 0.36, 1],
        delay: reduced ? 0 : SWEEP_DELAY,
      }}
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: calendarHours.needle,
        ml: `-${calendarHours.needle / 2}px`,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundColor: 'primary.main',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '50%',
          width: calendarHours.needleDot,
          height: calendarHours.needleDot,
          borderRadius: '50%',
          transform: 'translate(-50%, -35%)',
          backgroundColor: 'primary.main',
        },
      }}
    />
  );
};

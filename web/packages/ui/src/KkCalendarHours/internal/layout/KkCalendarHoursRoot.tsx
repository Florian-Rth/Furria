import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { CalendarHoursContext } from '../logic/calendar-hours-context';
import type { KkCalendarHoursAxis } from '../logic/calendar-hours-types';
import { useHoursLabelMeter } from '../logic/use-hours-label-meter';
import { useHoursTrackWidth } from '../logic/use-hours-track-width';

const { calendarHours, line, radius } = kkTokens;

const gridlinePaint =
  (hours: number) =>
  (theme: Theme): CSSObject => {
    const rule = (theme.vars ?? theme).palette.divider;

    return {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      pointerEvents: 'none',
      backgroundImage: `linear-gradient(to right, ${rule} 1px, transparent 1px)`,
      backgroundSize: `calc(100% / ${hours}) 100%`,
      opacity: 0.7,
    };
  };

const framePaint =
  (framed: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    minWidth: 0,
    ...(framed
      ? {
          backgroundColor: 'background.paper',
          borderWidth: line.hair,
          borderStyle: 'solid',
          borderColor: (theme.vars ?? theme).palette.divider,
          borderRadius: `${radius.base}px`,
        }
      : {}),
  });

interface KkCalendarHoursRootProps extends PropsWithChildren {
  label: string;
  axis: KkCalendarHoursAxis;
  framed: boolean;
  sx?: KkSx;
}

export const KkCalendarHoursRoot: FC<KkCalendarHoursRootProps> = ({
  label,
  axis,
  framed,
  sx,
  children,
}) => {
  const reduced = useReducedMotion();
  const meter = useHoursLabelMeter();
  const track = useHoursTrackWidth();
  const hours = Math.max(axis.endHour - axis.startHour, 1);
  const state = {
    axis,
    trackWidth: track.width,
    measureTrack: track.measure,
    meter,
    reduced,
  };

  return (
    <CalendarHoursContext value={state}>
      <Stack
        component="section"
        aria-label={label}
        data-kk-calendar-hours
        sx={[framePaint(framed), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <Box aria-hidden sx={[{ left: calendarHours.dayColumn }, gridlinePaint(hours)]} />
        {children}
      </Stack>
    </CalendarHoursContext>
  );
};

import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkDateQuickChoice } from '../../../internal/date-field';
import { toMomentDayLabel } from '../moment-label';
import { useMomentDrawer } from '../use-moment-drawer';
import { KkMomentDayDrawer } from './KkMomentDayDrawer';
import { KkMomentFace } from './KkMomentFace';
import { KkMomentSegment } from './KkMomentSegment';
import { KkMomentTimeDrawer } from './KkMomentTimeDrawer';

const DAY_SEGMENT_LABEL = 'Tag';
const TIME_SEGMENT_LABEL = 'Uhrzeit';
const DAY_PLACEHOLDER = 'Tag wählen';
const TIME_PLACEHOLDER = '--:--';
const DRAWER_SEPARATOR = ' · ';
const NO_QUICK_DAYS: readonly KkDateQuickChoice[] = [];
const NO_QUICK_TIMES: readonly string[] = [];

interface KkMomentFieldPickerProps {
  label: string;
  day: string;
  time: string;
  onDayChange: (day: string) => void;
  onTimeChange: (time: string) => void;
  quickDays?: readonly KkDateQuickChoice[];
  quickTimes?: readonly string[];
  error?: string;
}

export const KkMomentFieldPicker: FC<KkMomentFieldPickerProps> = ({
  label,
  day,
  time,
  onDayChange,
  onTimeChange,
  quickDays = NO_QUICK_DAYS,
  quickTimes = NO_QUICK_TIMES,
  error,
}) => {
  const drawer = useMomentDrawer();
  const dayText = toMomentDayLabel(day, new Date());
  const timeText = time === '' ? null : time;
  const isInvalid = error !== undefined;
  const isDayDrawerOpen = drawer.open === 'day';
  const isTimeDrawerOpen = drawer.open === 'time';
  const dayDrawerLabel = `${label}${DRAWER_SEPARATOR}${DAY_SEGMENT_LABEL}`;
  const timeDrawerLabel = `${label}${DRAWER_SEPARATOR}${TIME_SEGMENT_LABEL}`;
  const errorLine = isInvalid ? (
    <Typography variant="caption" role="alert" sx={{ color: 'error.main', px: 1.75 }}>
      {error}
    </Typography>
  ) : null;

  return (
    <>
      <KkMomentFace invalid={isInvalid}>
        <KkMomentSegment
          icon="calendar"
          label={dayDrawerLabel}
          text={dayText}
          placeholder={DAY_PLACEHOLDER}
          width="grow"
          onSelect={drawer.openDay}
        />
        <KkMomentSegment
          icon="clock"
          label={timeDrawerLabel}
          text={timeText}
          placeholder={TIME_PLACEHOLDER}
          width="fit"
          onSelect={drawer.openTime}
        />
      </KkMomentFace>
      {errorLine}
      <KkMomentDayDrawer
        open={isDayDrawerOpen}
        label={dayDrawerLabel}
        day={day}
        quickDays={quickDays}
        onDayChange={onDayChange}
        onClose={drawer.close}
      />
      <KkMomentTimeDrawer
        open={isTimeDrawerOpen}
        label={timeDrawerLabel}
        time={time}
        quickTimes={quickTimes}
        onTimeChange={onTimeChange}
        onClose={drawer.close}
      />
    </>
  );
};

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { goldInkOf } from '../../../internal/gold-ink';
import { groupToneFieldScheme } from '../../../internal/group-tone';
import { inkWash } from '../../../internal/ink-wash';
import { applyScheme, schemeFill } from '../../../internal/scheme-paint';
import { usualRingPaint } from '../../../internal/usual-ring';
import { kkTokens } from '../../../tokens';
import { KK_CALENDAR_STICKY } from '../../calendar-sticky';
import type { KkCalendarDayData, KkCalendarMark } from '../../calendar-strip-types';

const { chrome, radius, line } = kkTokens;
const DOT = 5;
const OWED_MARK = 6;
const LANDMARK_MARK = 6;
const PAST_OPACITY = 0.42;
const NUMERAL_WIDTH = '1.875rem';
const NUMERAL_HEIGHT = '1.5rem';

const cellPaint =
  (day: KkCalendarDayData) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.25,
    minWidth: 0,
    height: `${KK_CALENDAR_STICKY.stripCell}px`,
    borderRadius: `${radius.base - 4}px`,
    ...(day.carnival
      ? applyScheme(theme, schemeFill(chrome.light.glowGold, chrome.dark.glowGold))
      : {}),
    ...(day.selected
      ? { boxShadow: `inset 0 0 0 ${line.hair}px ${(theme.vars ?? theme).palette.text.primary}` }
      : {}),
    '@media (hover: hover)': { '&:hover': { backgroundColor: inkWash(theme, '6%') } },
    ...focusRing(theme),
  });

const numeralPaint =
  (day: KkCalendarDayData) =>
  (theme: Theme): CSSObject => {
    const base: CSSObject = {
      display: 'grid',
      placeItems: 'center',
      width: NUMERAL_WIDTH,
      height: NUMERAL_HEIGHT,
      borderRadius: `${radius.pill}px`,
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1,
    };

    if (day.isToday) {
      return { ...base, backgroundColor: 'primary.main', color: 'primary.contrastText' };
    }
    if (day.landmark) {
      return { ...base, ...goldInkOf(theme) };
    }

    return { ...base, color: 'text.primary', opacity: day.isPast ? PAST_OPACITY : 1 };
  };

const markPaint =
  (mark: KkCalendarMark) =>
  (theme: Theme): CSSObject => ({
    width: DOT,
    height: DOT,
    borderRadius: '50%',
    flexShrink: 0,
    ...(mark === 'club'
      ? { backgroundColor: 'text.primary' }
      : applyScheme(theme, groupToneFieldScheme(mark))),
  });

const usualPaint =
  (mark: KkCalendarMark) =>
  (theme: Theme): CSSObject => ({
    width: DOT,
    height: DOT,
    borderRadius: '50%',
    flexShrink: 0,
    boxSizing: 'border-box',
    ...usualRingPaint(theme, mark),
  });

const OWED_PAINT: CSSObject = {
  width: OWED_MARK,
  height: OWED_MARK,
  flexShrink: 0,
  backgroundColor: 'warning.main',
  transform: 'rotate(45deg)',
  borderRadius: '1px',
};

const LANDMARK_PAINT: CSSObject = {
  position: 'absolute',
  top: 3,
  right: 3,
  width: LANDMARK_MARK,
  height: LANDMARK_MARK,
  backgroundColor: 'warning.main',
  clipPath: 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)',
};

interface KkCalendarStripDayProps {
  day: KkCalendarDayData;
  onSelect: (isoDay: string) => void;
}

export const KkCalendarStripDay: FC<KkCalendarStripDayProps> = ({ day, onSelect }) => {
  const select = (): void => {
    onSelect(day.isoDay);
  };

  const owed = day.owed ? <Box component="span" sx={OWED_PAINT} /> : null;
  const marks = day.marks.map((mark, index) => (
    <Box key={`${mark}-${index.toString()}`} component="span" sx={markPaint(mark)} />
  ));
  const usualMarks = day.usualMarks.map((mark, index) => (
    <Box key={`usual-${mark}-${index.toString()}`} component="span" sx={usualPaint(mark)} />
  ));
  const landmark = day.landmark ? <Box aria-hidden component="span" sx={LANDMARK_PAINT} /> : null;
  const outside = day.inMonth ? undefined : true;

  return (
    <ButtonBase
      aria-label={day.label}
      aria-current={day.selected ? 'date' : undefined}
      data-kk-calendar-day-cell={day.isoDay}
      data-kk-calendar-day-outside={outside}
      onClick={select}
      sx={cellPaint(day)}
    >
      <Typography
        component="span"
        aria-hidden
        variant="h3"
        data-kk-calendar-day-numeral
        sx={numeralPaint(day)}
      >
        {day.dayNumber}
      </Typography>
      <Stack
        direction="row"
        aria-hidden
        sx={{ alignItems: 'center', justifyContent: 'center', gap: '2px', height: OWED_MARK }}
      >
        {owed}
        {marks}
        {usualMarks}
      </Stack>
      {landmark}
    </ButtonBase>
  );
};

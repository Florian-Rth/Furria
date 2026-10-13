import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { goldInkOf } from '../../../internal/gold-ink';
import { inkWash } from '../../../internal/ink-wash';
import { applyScheme, schemeFill } from '../../../internal/scheme-paint';
import { kkTokens } from '../../../tokens';
import type { KkMonthBoardDayData } from '../logic/month-board-types';

const { monthBoard, chrome, line, radius } = kkTokens;
const NO_HIDDEN = 0;

const markWash = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeFill(chrome.light.glowGold, chrome.dark.glowGold));

const dayPaint =
  (day: KkMonthBoardDayData, column: number) =>
  (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;

    return {
      position: 'relative',
      gridColumn: `${column + 1}`,
      gridRow: '1 / -1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'space-between',
      minWidth: 0,
      borderLeft: column === 0 ? 'none' : `${line.hair}px solid ${palette.divider}`,
      ...(day.mark === null ? {} : markWash(theme)),
      ...(day.selected
        ? { boxShadow: `inset 0 0 0 ${line.section}px ${palette.text.primary}` }
        : {}),
      '@media (hover: hover)': {
        '&:hover': { backgroundColor: inkWash(theme, '5%') },
      },
      ...focusRing(theme),
    };
  };

const numeralPaint =
  (day: KkMonthBoardDayData) =>
  (theme: Theme): CSSObject => {
    if (day.isToday) {
      return { backgroundColor: 'primary.main', color: 'primary.contrastText' };
    }
    if (!day.inMonth) {
      return { color: 'text.disabled' };
    }

    return day.mark === null ? { color: 'text.primary' } : goldInkOf(theme);
  };

interface KkMonthBoardDayProps {
  day: KkMonthBoardDayData;
  column: number;
  hidden: number;
  onSelect: (isoDay: string) => void;
}

export const KkMonthBoardDay: FC<KkMonthBoardDayProps> = ({ day, column, hidden, onSelect }) => {
  const select = (): void => {
    onSelect(day.isoDay);
  };

  const notch = day.awaitsAnswer ? (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: monthBoard.notch,
        height: monthBoard.notch,
        backgroundColor: 'primary.main',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
      }}
    />
  ) : null;
  const markLabel =
    day.markLabel === null ? null : (
      <Typography
        variant="caption"
        noWrap
        sx={(theme) => ({
          display: { xs: 'none', sm: 'block' },
          minWidth: 0,
          fontWeight: 700,
          ...goldInkOf(theme),
        })}
      >
        {day.markLabel}
      </Typography>
    );
  const hiddenLabel = `+${hidden}`;
  const overflow =
    hidden === NO_HIDDEN ? null : (
      <Typography
        aria-hidden
        variant="caption"
        sx={{
          height: monthBoard.overflowRow,
          px: 0.5,
          fontWeight: 700,
          lineHeight: monthBoard.overflowRow,
          color: 'text.secondary',
        }}
      >
        {hiddenLabel}
      </Typography>
    );

  return (
    <ButtonBase
      aria-label={day.label}
      aria-pressed={day.selected}
      data-kk-month-board-day={day.isoDay}
      onClick={select}
      sx={dayPaint(day, column)}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 0.5,
          height: monthBoard.dayRow,
          px: 0.25,
          minWidth: 0,
        }}
      >
        <Typography
          component="span"
          variant="h4"
          sx={[
            {
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              width: monthBoard.numeral,
              height: monthBoard.numeral,
              borderRadius: `${radius.bar}px`,
              fontVariantNumeric: 'tabular-nums',
            },
            numeralPaint(day),
          ]}
        >
          {day.dayNumber}
        </Typography>
        {markLabel}
      </Stack>
      {overflow}
      {notch}
    </ButtonBase>
  );
};

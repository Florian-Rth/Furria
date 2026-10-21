import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { highlightMark, highlightPaint } from '../../../internal/highlight-paint';
import { redInk } from '../../../internal/red-ink';
import { safeArea } from '../../../internal/safe-area';
import { applyScheme } from '../../../internal/scheme-paint';
import type { KkCalendarHeadUnder } from '../../../KkCalendarStrip/calendar-sticky';
import { KK_CALENDAR_HEAD_TOP, KK_CALENDAR_STICKY } from '../../../KkCalendarStrip/calendar-sticky';
import { kkTokens } from '../../../tokens';

export type KkCalendarDayTone = 'today' | 'near' | 'quiet' | 'past';

const HEAD_LAYER = 2;
const STAR = 9;
const { chrome } = kkTokens;

const washOf = (glow: string): string => `linear-gradient(90deg, ${glow}, transparent 70%)`;

const carnivalWash = (theme: Theme): CSSObject =>
  applyScheme(theme, {
    light: { backgroundImage: washOf(chrome.light.glowGold) },
    dark: { backgroundImage: washOf(chrome.dark.glowGold) },
  });

const headPaint =
  (under: KkCalendarHeadUnder, carnival: boolean, highlight: boolean) =>
  (theme: Theme): CSSObject => ({
    ...(highlight ? highlightPaint(theme) : {}),
    position: 'sticky',
    top: safeArea('top', KK_CALENDAR_HEAD_TOP[under]),
    zIndex: HEAD_LAYER,
    height: `${KK_CALENDAR_STICKY.dayHead}px`,
    alignItems: 'center',
    gap: 1,
    px: 0.75,
    minWidth: 0,
    backgroundColor: 'background.default',
    boxShadow: `0 -${KK_CALENDAR_STICKY.chromeGap}px 0 0 ${(theme.vars ?? theme).palette.background.default}`,
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    ...(carnival ? carnivalWash(theme) : {}),
  });

const relativePaint =
  (tone: KkCalendarDayTone) =>
  (theme: Theme): CSSObject => {
    if (tone === 'today') {
      return { fontWeight: 900, ...redInk(theme) };
    }

    return { fontWeight: 700, color: tone === 'near' ? 'text.primary' : 'text.secondary' };
  };

const STAR_PAINT: CSSObject = {
  width: STAR,
  height: STAR,
  flexShrink: 0,
  backgroundColor: 'warning.main',
  clipPath: 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)',
};

interface KkCalendarAgendaDayHeadProps {
  date: string;
  relative: string | null;
  tone: KkCalendarDayTone;
  landmark: string | null;
  carnival: boolean;
  note: string | null;
  under: KkCalendarHeadUnder;
  highlight: boolean;
}

export const KkCalendarAgendaDayHead: FC<KkCalendarAgendaDayHeadProps> = ({
  date,
  relative,
  tone,
  landmark,
  carnival,
  note,
  under,
  highlight,
}) => {
  const relativeLine =
    relative === null ? null : (
      <Typography component="span" variant="caption" noWrap sx={relativePaint(tone)}>
        {relative}
      </Typography>
    );
  const landmarkLine =
    landmark === null ? null : (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}>
        <Box aria-hidden component="span" sx={STAR_PAINT} />
        <Typography
          component="span"
          variant="caption"
          noWrap
          sx={(theme) => ({ fontWeight: 800, ...goldInkOf(theme) })}
        >
          {landmark}
        </Typography>
      </Stack>
    );
  const noteLine =
    note === null ? null : (
      <Typography
        component="span"
        variant="caption"
        noWrap
        sx={{ color: 'text.disabled', fontWeight: 600, ml: 'auto' }}
      >
        {note}
      </Typography>
    );

  return (
    <Stack
      direction="row"
      data-kk-calendar-day-head
      {...highlightMark(highlight)}
      sx={headPaint(under, carnival, highlight)}
    >
      <Typography
        component="h2"
        variant="h4"
        noWrap
        sx={{
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
          color: tone === 'past' ? 'text.secondary' : 'text.primary',
        }}
      >
        {date}
      </Typography>
      {relativeLine}
      {landmarkLine}
      {noteLine}
    </Stack>
  );
};

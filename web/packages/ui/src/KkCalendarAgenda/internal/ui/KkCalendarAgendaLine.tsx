import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { groupToneFieldScheme } from '../../../internal/group-tone';
import { highlightMark, highlightPaint } from '../../../internal/highlight-paint';
import { inkWash } from '../../../internal/ink-wash';
import { lineClamp } from '../../../internal/line-clamp';
import { redInk } from '../../../internal/red-ink';
import { applyScheme } from '../../../internal/scheme-paint';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkCalendarMark } from '../../../KkCalendarStrip/calendar-strip-types';
import type { KkEntryKindGlyphKind } from '../../../KkEntryKindGlyph';
import { KkEntryKindGlyph } from '../../../KkEntryKindGlyph';
import { kkTokens } from '../../../tokens';
import {
  AGENDA_COLUMN_GAP,
  AGENDA_GLYPH_COLUMN,
  AGENDA_ROW_X,
  AGENDA_TIME_COLUMN,
  AGENDA_WIDE_LINE,
} from '../logic/agenda-columns';
import { rowDelayOf } from '../logic/agenda-motion';

export interface KkCalendarLineGroup {
  key: string;
  name: string;
  mark: KkCalendarMark;
}

const HINGED = { opacity: 0, rotateX: -72 } as const;
const FADED = { opacity: 0 } as const;
const SHOWN = { opacity: 1, rotateX: 0 } as const;
const ROW_SECONDS = 0.36;
const EDGE = 3;
const DOT = 7;
const LIVE_DOT = 7;
const TITLE_LINES = 3;

const asidePaint = (theme: Theme): CSSObject => ({
  gridColumn: '1 / -1',
  justifySelf: 'start',
  minWidth: 0,
  mt: -0.5,
  pl: `calc(${AGENDA_TIME_COLUMN} + ${AGENDA_GLYPH_COLUMN} + ${theme.spacing(AGENDA_COLUMN_GAP * 2)})`,
  [`@container (min-width: ${AGENDA_WIDE_LINE})`]: {
    gridColumn: 2,
    gridRow: 1,
    justifySelf: 'end',
    alignSelf: 'center',
    mt: 0,
    pl: 0,
  },
});

const META_FLOW: CSSObject = {
  display: 'block',
  pt: 0.25,
  mr: -1,
  lineHeight: 1.5,
  '& > span': { display: 'inline-flex', verticalAlign: 'middle', mr: 1 },
};

const markFill = (theme: Theme, mark: KkCalendarMark): CSSObject =>
  mark === 'club'
    ? { backgroundColor: (theme.vars ?? theme).palette.text.primary }
    : applyScheme(theme, groupToneFieldScheme(mark));

const rowPaint =
  (selected: boolean, highlight: boolean) =>
  (theme: Theme): CSSObject => ({
    ...(highlight ? highlightPaint(theme) : {}),
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    columnGap: 0.5,
    rowGap: 0.5,
    pl: AGENDA_ROW_X,
    pr: 0.5,
    py: 0.625,
    minWidth: 0,
    ...(selected ? { backgroundColor: inkWash(theme, '6%') } : {}),
    '&:first-of-type': { borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' },
    '&:last-of-type': { borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit' },
  });

const edgePaint =
  (mark: KkCalendarMark, live: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    left: 0,
    top: theme.spacing(1),
    bottom: theme.spacing(1),
    width: EDGE,
    borderRadius: `0 ${EDGE}px ${EDGE}px 0`,
    ...(live ? { backgroundColor: 'primary.main' } : markFill(theme, mark)),
  });

const mainPaint = (theme: Theme): CSSObject => ({
  display: 'grid',
  gridTemplateColumns: `${AGENDA_TIME_COLUMN} ${AGENDA_GLYPH_COLUMN} minmax(0, 1fr)`,
  columnGap: AGENDA_COLUMN_GAP,
  alignItems: 'start',
  justifyItems: 'start',
  textAlign: 'left',
  minWidth: 0,
  minHeight: kkTokens.tapTarget,
  py: 0.25,
  borderRadius: `${kkTokens.radius.bar * 2}px`,
  color: 'inherit',
  ...focusRing(theme),
});

const dotPaint =
  (mark: KkCalendarMark) =>
  (theme: Theme): CSSObject => ({
    width: DOT,
    height: DOT,
    borderRadius: '50%',
    flexShrink: 0,
    ...markFill(theme, mark),
  });

const LIVE_DOT_PAINT: CSSObject = {
  width: LIVE_DOT,
  height: LIVE_DOT,
  borderRadius: '50%',
  flexShrink: 0,
  backgroundColor: 'primary.main',
  animation: kkTokens.motion.breath,
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};

interface KkCalendarAgendaLineProps {
  kind: KkEntryKindGlyphKind;
  title: string;
  venue: string | null;
  groups: readonly KkCalendarLineGroup[];
  liveLabel: string | null;
  tone: KkCalendarMark;
  quiet: boolean;
  selected: boolean;
  highlight: boolean;
  order: number;
  accessibleLabel: string;
  landing?: string;
  time: ReactNode;
  trailing?: ReactNode;
  aside?: ReactNode;
  below?: ReactNode;
  onSelect: () => void;
}

export const KkCalendarAgendaLine: FC<KkCalendarAgendaLineProps> = ({
  kind,
  title,
  venue,
  groups,
  liveLabel,
  tone,
  quiet,
  selected,
  highlight,
  order,
  accessibleLabel,
  landing,
  time,
  trailing,
  aside,
  below,
  onSelect,
}) => {
  const reduced = useReducedMotion();
  const initial = reduced ? FADED : HINGED;
  const transition = { duration: ROW_SECONDS, delay: rowDelayOf(order), ease: 'easeOut' } as const;
  const live = liveLabel !== null;

  const liveMark =
    liveLabel === null ? null : (
      <Stack direction="row" component="span" sx={{ alignItems: 'center', gap: 0.5 }}>
        <Box component="span" sx={LIVE_DOT_PAINT} />
        <Typography
          component="span"
          variant="caption"
          sx={(theme) => ({ fontWeight: 900, ...redInk(theme) })}
        >
          {liveLabel}
        </Typography>
      </Stack>
    );
  const venueMark =
    venue === null ? null : (
      <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
        {venue}
      </Typography>
    );
  const groupMarks = groups.map((group) => (
    <Stack key={group.key} direction="row" component="span" sx={{ alignItems: 'center', gap: 0.5 }}>
      <Box component="span" sx={dotPaint(group.mark)} />
      <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
        {group.name}
      </Typography>
    </Stack>
  ));
  const trailingSlot =
    trailing === undefined ? null : (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, alignSelf: 'center' }}>
        {trailing}
      </Stack>
    );
  const asideSlot =
    aside === undefined ? null : (
      <Box data-kk-calendar-line-aside sx={asidePaint}>
        {aside}
      </Box>
    );
  const belowSlot =
    below === undefined ? null : (
      <Box sx={{ gridColumn: '1 / -1', minWidth: 0, pr: 0.75, pb: 0.5 }}>{below}</Box>
    );

  return (
    <Box
      component={motion.li}
      initial={initial}
      animate={SHOWN}
      transition={transition}
      data-kk-calendar-line
      data-kk-landing={landing}
      {...highlightMark(highlight)}
      sx={rowPaint(selected, highlight)}
    >
      <Box aria-hidden component="span" sx={edgePaint(tone, live)} />
      <ButtonBase
        aria-label={accessibleLabel}
        aria-current={selected ? 'true' : undefined}
        onClick={onSelect}
        sx={mainPaint}
      >
        {time}
        <Box
          component="span"
          aria-hidden
          sx={(theme) => ({
            display: 'grid',
            placeItems: 'center',
            pt: 0.125,
            ...(live ? redInk(theme) : { color: quiet ? 'text.disabled' : 'text.secondary' }),
          })}
        >
          <KkEntryKindGlyph kind={kind} />
        </Box>
        <Box component="span" sx={{ display: 'block', minWidth: 0, width: '100%' }}>
          <Typography
            component="span"
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.25,
              color: quiet ? 'text.secondary' : 'text.primary',
              hyphens: 'manual',
              overflowWrap: 'break-word',
              ...lineClamp(TITLE_LINES),
            }}
          >
            {title}
          </Typography>
          <Box component="span" sx={META_FLOW}>
            {liveMark}
            {venueMark}
            {groupMarks}
          </Box>
        </Box>
      </ButtonBase>
      {trailingSlot}
      {asideSlot}
      {belowSlot}
    </Box>
  );
};

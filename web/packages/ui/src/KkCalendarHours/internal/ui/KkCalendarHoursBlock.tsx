import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkEntryKindGlyph } from '../../../KkEntryKindGlyph';
import { kkTokens } from '../../../tokens';
import { HALO_TEXT, hoursFillPaint, hoursToneInk } from '../calendar-hours-paint';
import { useCalendarHours } from '../logic/calendar-hours-context';
import { hoursGrowDelayOf, hoursLabelPlanOf } from '../logic/calendar-hours-geometry';
import type { KkCalendarPlacedBlock } from '../logic/calendar-hours-types';
import { KkCalendarHoursAnswerBadge } from './KkCalendarHoursAnswerBadge';

const { calendarHours, radius, motion: kkMotion, type } = kkTokens;
const PERCENT = 100;
const TIME_WEIGHT = 800;
const TITLE_WEIGHT = 650;
const MEASURE_SLACK = 2;
const HALO_ROOM = 4;
const BADGE_OFFSET = 0;
const GLYPH_PX = 14;
const BADGE_INSET = 2;
const OPEN_END_FADE = 'linear-gradient(to right, #000 55%, transparent)';
const GROWN = { scaleX: 1 } as const;
const UNGROWN = { scaleX: 0 } as const;
const SHOWN = { opacity: 1 } as const;
const HIDDEN = { opacity: 0 } as const;
const ROUNDED = `${radius.bar + 1}px`;

const fillShape = (placed: KkCalendarPlacedBlock): CSSObject => {
  const { block } = placed;

  return {
    position: 'absolute',
    top: calendarHours.fillInset,
    bottom: calendarHours.fillInset,
    left: 0,
    width: `${(placed.width / placed.room) * PERCENT}%`,
    minWidth: calendarHours.minBlock,
    pointerEvents: 'auto',
    transformOrigin: 'left center',
    borderLeftWidth: block.continuesBefore ? 0 : calendarHours.edge,
    borderLeftStyle: 'solid',
    borderTopLeftRadius: block.continuesBefore ? 0 : ROUNDED,
    borderBottomLeftRadius: block.continuesBefore ? 0 : ROUNDED,
    borderTopRightRadius: block.continuesAfter ? 0 : ROUNDED,
    borderBottomRightRadius: block.continuesAfter ? 0 : ROUNDED,
    ...(block.openEnd ? { maskImage: OPEN_END_FADE } : {}),
    animation: block.running ? kkMotion.breath : 'none',
  };
};

const fillPaint =
  (placed: KkCalendarPlacedBlock) =>
  (theme: Theme): CSSObject => ({
    ...fillShape(placed),
    ...hoursFillPaint(theme, placed.block.tone, placed.block.selected),
    ...(placed.block.selected
      ? {
          outline: `${kkTokens.line.section}px solid ${(theme.vars ?? theme).palette.text.primary}`,
        }
      : {}),
  });

const hostPaint =
  (placed: KkCalendarPlacedBlock) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    left: `${placed.left * PERCENT}%`,
    width: `${placed.room * PERCENT}%`,
    top: `calc(${theme.spacing(calendarHours.lanePad)} + ${placed.row} * (${calendarHours.row} + ${calendarHours.rowGap}px))`,
    height: calendarHours.row,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    pointerEvents: 'none',
    transition: 'opacity 200ms ease-out',
    zIndex: placed.block.selected ? 2 : 1,
    ...focusRing(theme),
  });

interface KkCalendarHoursBlockProps {
  placed: KkCalendarPlacedBlock;
  laneIndex: number;
  onSelect: (id: string) => void;
}

export const KkCalendarHoursBlock: FC<KkCalendarHoursBlockProps> = ({
  placed,
  laneIndex,
  onSelect,
}) => {
  const { trackWidth, meter, reduced } = useCalendarHours();
  const { block } = placed;
  const blockPx = Math.max(placed.width * trackWidth, calendarHours.minBlock);
  const plan = hoursLabelPlanOf(
    {
      roomPx: placed.room * trackWidth,
      blockPx,
      glyphPx: GLYPH_PX,
      timePx: meter(block.time, TIME_WEIGHT) + MEASURE_SLACK + HALO_ROOM,
      titlePx: meter(block.title, TITLE_WEIGHT) + MEASURE_SLACK + HALO_ROOM,
      gapPx: calendarHours.labelGap,
      padPx: calendarHours.labelPad + calendarHours.edge,
    },
    placed.roomBefore * trackWidth,
  );
  const leads = plan.side === 'before';
  const fitsGlyph = blockPx >= GLYPH_PX + (calendarHours.labelPad + calendarHours.edge) * 2;
  const level = leads ? 'full' : plan.level;
  const delay = reduced ? 0 : hoursGrowDelayOf(laneIndex, placed.left);
  const grow = {
    duration: reduced ? 0 : calendarHours.growSeconds,
    ease: [0.22, 0.61, 0.36, 1],
    delay,
  } as const;
  const reveal = {
    duration: reduced ? 0 : 0.2,
    delay: reduced ? 0 : delay + calendarHours.growSeconds * 0.6,
  } as const;

  const select = (): void => {
    onSelect(block.id);
  };

  const glyph =
    level === 'none' || (leads && !fitsGlyph) ? null : (
      <Box component="span" sx={(theme) => hoursToneInk(theme, block.tone)}>
        <KkEntryKindGlyph kind={block.kind} size="tiny" />
      </Box>
    );
  const time =
    level === 'full' || level === 'time' ? (
      <Typography
        component="span"
        variant="caption"
        sx={{
          fontWeight: TIME_WEIGHT,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          color: 'text.primary',
          ...HALO_TEXT,
        }}
      >
        {block.time}
      </Typography>
    ) : null;
  const title =
    level === 'full' ? (
      <Typography
        component="span"
        variant="caption"
        noWrap
        sx={{
          fontWeight: TITLE_WEIGHT,
          letterSpacing: type.tracking.tight,
          lineHeight: 1.2,
          color: 'text.primary',
          minWidth: 0,
          ...HALO_TEXT,
        }}
      >
        {block.title}
      </Typography>
    ) : null;
  const inlineTime = leads ? null : time;
  const inlineTitle = leads ? null : title;
  const lead = leads ? (
    <Stack
      component={motion.span}
      direction="row"
      initial={reduced ? SHOWN : HIDDEN}
      animate={SHOWN}
      transition={reveal}
      data-kk-calendar-hours-lead
      sx={{
        position: 'absolute',
        right: '100%',
        top: 0,
        bottom: 0,
        alignItems: 'center',
        gap: `${calendarHours.labelGap}px`,
        pr: `${calendarHours.labelGap}px`,
        pointerEvents: 'auto',
        whiteSpace: 'nowrap',
      }}
    >
      {time}
      {title}
    </Stack>
  ) : null;
  const badge =
    block.badge === null ? null : (
      <Box
        component={motion.span}
        initial={reduced ? SHOWN : HIDDEN}
        animate={SHOWN}
        transition={reveal}
        sx={{
          position: 'absolute',
          top: BADGE_OFFSET,
          left: `calc(${(placed.width / placed.room) * PERCENT}% - ${calendarHours.badge + BADGE_INSET}px)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <KkCalendarHoursAnswerBadge badge={block.badge} reduced={reduced} />
      </Box>
    );

  return (
    <ButtonBase
      aria-label={block.label}
      aria-pressed={block.selected}
      data-kk-calendar-hours-block={block.id}
      onClick={select}
      sx={hostPaint(placed)}
    >
      <Box
        component={motion.span}
        initial={reduced ? GROWN : UNGROWN}
        animate={GROWN}
        transition={grow}
        sx={fillPaint(placed)}
      />
      <Stack
        component={motion.span}
        direction="row"
        initial={reduced ? SHOWN : HIDDEN}
        animate={SHOWN}
        transition={reveal}
        sx={{
          position: 'relative',
          alignItems: 'center',
          gap: `${calendarHours.labelGap}px`,
          px: `${calendarHours.labelPad}px`,
          minWidth: 0,
          maxWidth: '100%',
          pointerEvents: 'auto',
          pl: `${calendarHours.labelPad + (block.continuesBefore ? 0 : calendarHours.edge)}px`,
        }}
      >
        {glyph}
        {inlineTime}
        {inlineTitle}
      </Stack>
      {lead}
      {badge}
    </ButtonBase>
  );
};

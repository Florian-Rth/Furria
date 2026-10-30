import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { redInk } from '../../../internal/red-ink';
import { rowDividerTop } from '../../../internal/row-divider';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import { kkTokens } from '../../../tokens';
import { agendaMarkerDelayOf, agendaRowDelayOf } from '../logic/agenda-motion';

export type KkAgendaRowMark = 'current' | 'owed' | 'none';

const DATE_WIDTH = '2.75rem';
const MARKER_WIDTH = '0.25rem';
const MARKER_INSET = '0.625rem';
const ROW_RISE = 10;
const MARKER_DROP = -18;
const ARRIVE = { duration: 0.28, ease: [0.22, 0.61, 0.36, 1] } as const;
const MARKER_LAND = { type: 'spring', stiffness: 520, damping: 34 } as const;
const SETTLED = { opacity: 1, y: 0 } as const;

const rowPaint: CSSObject = {
  ...rowDividerTop,
  position: 'relative',
  alignItems: 'flex-start',
  gap: 1.25,
  py: 1,
  pl: 1.25,
  minWidth: 0,
  listStyle: 'none',
};

const SAME_DAY_PAINT: CSSObject = { ...rowPaint, borderTopWidth: 0, pt: 0 };

const weekdayPaint =
  (mark: KkAgendaRowMark) =>
  (theme: Theme): CSSObject => ({
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: kkTokens.type.tracking.label,
    textTransform: 'uppercase',
    color: 'text.secondary',
    ...(mark === 'current' ? redInk(theme) : {}),
    ...(mark === 'owed' ? goldInkOf(theme) : {}),
  });

const dayPaint =
  (mark: KkAgendaRowMark) =>
  (theme: Theme): CSSObject => ({
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
    ...(mark === 'current' ? redInk(theme) : {}),
  });

const markerPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  left: 0,
  top: MARKER_INSET,
  bottom: MARKER_INSET,
  width: MARKER_WIDTH,
  borderRadius: `${kkTokens.radius.pill}px`,
  backgroundColor: (theme.vars ?? theme).palette.primary.main,
});

interface KkAgendaRowProps extends PropsWithChildren {
  weekday: string;
  day: string;
  dateLabel: string;
  mark: KkAgendaRowMark;
  markLabel: string | null;
  order: number;
  showsDate?: boolean;
}

export const KkAgendaRow: FC<KkAgendaRowProps> = ({
  weekday,
  day,
  dateLabel,
  mark,
  markLabel,
  order,
  showsDate = true,
  children,
}) => {
  const reducedMotion = useReducedMotion();
  const rowInitial = reducedMotion ? false : { opacity: 0, y: ROW_RISE };
  const markerInitial = reducedMotion ? false : { opacity: 0, y: MARKER_DROP };
  const marker =
    mark === 'current' ? (
      <Box
        aria-hidden
        component={motion.span}
        initial={markerInitial}
        animate={SETTLED}
        transition={{ ...MARKER_LAND, delay: agendaMarkerDelayOf(order) }}
        data-kk-agenda-marker
        sx={markerPaint}
      />
    ) : null;
  const dateFace = showsDate ? (
    <>
      <Typography aria-hidden component="span" variant="caption" sx={weekdayPaint(mark)}>
        {weekday}
      </Typography>
      <Typography aria-hidden component="span" variant="h3" sx={dayPaint(mark)}>
        {day}
      </Typography>
    </>
  ) : null;
  const markText = markLabel === null ? null : <KkVisuallyHidden>{markLabel}</KkVisuallyHidden>;

  return (
    <Stack
      component={motion.li}
      initial={rowInitial}
      animate={SETTLED}
      transition={{ ...ARRIVE, delay: agendaRowDelayOf(order) }}
      direction="row"
      data-kk-agenda-row={mark}
      sx={showsDate ? rowPaint : SAME_DAY_PAINT}
    >
      {marker}
      <Stack sx={{ width: DATE_WIDTH, flexShrink: 0, alignItems: 'center', pt: 0.25 }}>
        <KkVisuallyHidden>{dateLabel}</KkVisuallyHidden>
        {dateFace}
        {markText}
      </Stack>
      <Stack
        direction="row"
        sx={{
          flex: 1,
          minWidth: 0,
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: 1,
          rowGap: 0.5,
        }}
      >
        {children}
      </Stack>
    </Stack>
  );
};

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { inkWash } from '../../../internal/ink-wash';
import { usualRingPaint } from '../../../internal/usual-ring';
import type { KkCalendarMark } from '../../../KkCalendarStrip/calendar-strip-types';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import {
  AGENDA_COLUMN_GAP,
  AGENDA_GLYPH_COLUMN,
  AGENDA_ROW_X,
  AGENDA_TIME_COLUMN,
} from '../logic/agenda-columns';

const RING = 7;

const rowPaint = (theme: Theme): CSSObject => ({
  display: 'grid',
  gridTemplateColumns: `${AGENDA_TIME_COLUMN} ${AGENDA_GLYPH_COLUMN} minmax(0, 1fr) auto`,
  columnGap: AGENDA_COLUMN_GAP,
  alignItems: 'center',
  justifyItems: 'start',
  textAlign: 'left',
  width: '100%',
  minWidth: 0,
  minHeight: kkTokens.tapTarget,
  pl: AGENDA_ROW_X,
  pr: 1,
  py: 0.5,
  color: 'text.secondary',
  borderWidth: kkTokens.line.hair,
  borderStyle: 'dashed',
  borderColor: (theme.vars ?? theme).palette.divider,
  borderRadius: `${kkTokens.radius.base}px`,
  backgroundColor: 'transparent',
  ...focusRing(theme),
});

const actionablePaint = (theme: Theme): CSSObject => ({
  ...rowPaint(theme),
  '@media (hover: hover)': { '&:hover': { backgroundColor: inkWash(theme, '4%') } },
});

const ringPaint =
  (mark: KkCalendarMark) =>
  (theme: Theme): CSSObject => ({
    width: RING,
    height: RING,
    borderRadius: '50%',
    flexShrink: 0,
    boxSizing: 'border-box',
    ...usualRingPaint(theme, mark),
  });

interface KkCalendarAgendaUsualProps {
  time: string;
  until: string;
  title: string;
  groupName: string;
  mark: KkCalendarMark;
  venue: string | null;
  accessibleLabel: string;
  actionLabel?: string;
  onSelect?: () => void;
}

export const KkCalendarAgendaUsual: FC<KkCalendarAgendaUsualProps> = ({
  time,
  until,
  title,
  groupName,
  mark,
  venue,
  accessibleLabel,
  actionLabel,
  onSelect,
}) => {
  const venueMark =
    venue === null ? null : (
      <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
        {venue}
      </Typography>
    );
  const action =
    actionLabel === undefined ? (
      <Box component="span" />
    ) : (
      <Typography
        component="span"
        variant="caption"
        sx={{ color: 'text.primary', fontWeight: 800, whiteSpace: 'nowrap' }}
      >
        {actionLabel}
      </Typography>
    );
  const content = (
    <>
      <Stack component="span" aria-hidden sx={{ minWidth: 0, alignItems: 'flex-start' }}>
        <Typography
          component="span"
          variant="caption"
          sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1.25 }}
        >
          {time}
        </Typography>
        <Typography
          component="span"
          variant="caption"
          sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1.25, color: 'text.disabled' }}
        >
          {until}
        </Typography>
      </Stack>
      <Box
        component="span"
        aria-hidden
        sx={{ display: 'grid', placeItems: 'center', color: 'text.disabled' }}
      >
        <KkIcon name="clock" size="small" />
      </Box>
      <Box component="span" aria-hidden sx={{ display: 'block', minWidth: 0, width: '100%' }}>
        <Typography
          component="span"
          variant="body2"
          sx={{ display: 'block', fontStyle: 'italic', fontWeight: 600, lineHeight: 1.25 }}
        >
          {title}
        </Typography>
        <Stack
          direction="row"
          component="span"
          sx={{ alignItems: 'center', columnGap: 1, rowGap: 0.25, flexWrap: 'wrap', pt: 0.25 }}
        >
          <Stack direction="row" component="span" sx={{ alignItems: 'center', gap: 0.5 }}>
            <Box component="span" sx={ringPaint(mark)} />
            <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
              {groupName}
            </Typography>
          </Stack>
          {venueMark}
        </Stack>
      </Box>
      {action}
    </>
  );

  if (onSelect === undefined) {
    return (
      <Box role="note" aria-label={accessibleLabel} data-kk-calendar-usual sx={rowPaint}>
        {content}
      </Box>
    );
  }

  return (
    <ButtonBase
      aria-label={accessibleLabel}
      data-kk-calendar-usual
      onClick={onSelect}
      sx={actionablePaint}
    >
      {content}
    </ButtonBase>
  );
};

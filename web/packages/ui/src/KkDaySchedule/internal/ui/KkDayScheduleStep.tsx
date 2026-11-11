import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkDayScheduleStepProps {
  time: string;
  text: string;
  sx?: KkSx;
}

const RAIL_WIDTH = 2;
const DOT_SIZE = 1.25;
const STEP_PADDING = 0.75;

const railPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;
  const { fontSize, lineHeight } = theme.typography.body2;
  const dotCentre = `calc(${theme.spacing(STEP_PADDING)} + ${fontSize} * ${lineHeight} / 2)`;

  return {
    position: 'relative',
    flexShrink: 0,
    alignSelf: 'stretch',
    width: theme.spacing(DOT_SIZE),
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: `calc(50% - ${RAIL_WIDTH / 2}px)`,
      width: RAIL_WIDTH,
      backgroundColor: palette.divider,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: `calc(${dotCentre} - ${theme.spacing(DOT_SIZE / 2)})`,
      left: 0,
      width: theme.spacing(DOT_SIZE),
      height: theme.spacing(DOT_SIZE),
      borderRadius: '50%',
      boxSizing: 'border-box',
      border: `${RAIL_WIDTH}px solid ${palette.text.primary}`,
      backgroundColor: palette.background.paper,
    },
    'li:first-of-type > &::before': {
      top: dotCentre,
    },
    'li:last-of-type > &::before': {
      bottom: `calc(100% - ${dotCentre})`,
    },
    'li:only-of-type > &::before': { display: 'none' },
  };
};

export const KkDayScheduleStep: FC<KkDayScheduleStepProps> = ({ time, text, sx }) => (
  <Stack
    component="li"
    direction="row"
    data-kk-day-schedule-step
    sx={[{ gap: 1.25, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <Typography
      component="span"
      variant="body2"
      sx={{
        py: STEP_PADDING,
        flexShrink: 0,
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums lining-nums',
      }}
    >
      {time}
    </Typography>
    <Stack aria-hidden sx={railPaint} />
    <Typography
      component="span"
      variant="body2"
      sx={{ py: STEP_PADDING, flexGrow: 1, minWidth: 0, overflowWrap: 'anywhere' }}
    >
      {text}
    </Typography>
  </Stack>
);

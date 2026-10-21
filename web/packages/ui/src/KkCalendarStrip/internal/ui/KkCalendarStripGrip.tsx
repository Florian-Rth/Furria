import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { PanInfo } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { inkWash } from '../../../internal/ink-wash';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import type { KkCalendarPull } from '../../calendar-strip-types';
import { pullOf } from '../logic/strip-swipe';

const { calendarStrip, radius } = kkTokens;
const BAR_HEIGHT = 4;
const REACH = 12;

const gripPaint =
  (expanded: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    width: '100%',
    height: calendarStrip.grip,
    touchAction: 'none',
    cursor: 'grab',
    borderRadius: `0 0 ${radius.base}px ${radius.base}px`,
    '&::before': { content: '""', position: 'absolute', inset: `-${REACH}px 0` },
    '& [data-kk-calendar-strip-grip-bar]': {
      width: calendarStrip.gripBar,
      height: BAR_HEIGHT,
      borderRadius: `${radius.pill}px`,
      backgroundColor: inkWash(theme, expanded ? '38%' : '24%'),
      transition: 'background-color 160ms ease-out, width 160ms ease-out',
    },
    '@media (hover: hover)': {
      '&:hover [data-kk-calendar-strip-grip-bar]': { backgroundColor: inkWash(theme, '48%') },
    },
    ...focusRing(theme),
  });

interface KkCalendarStripGripProps {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  onPull: (pull: Exclude<KkCalendarPull, 'none'>) => void;
  sx?: KkSx;
}

export const KkCalendarStripGrip: FC<KkCalendarStripGripProps> = ({
  label,
  expanded,
  onToggle,
  onPull,
  sx,
}) => {
  const settle = (_event: PointerEvent, info: PanInfo): void => {
    const pull = pullOf(info.offset.y, info.velocity.y, calendarStrip.pullThreshold);

    if (pull !== 'none') {
      onPull(pull);
    }
  };

  return (
    <Box
      component={motion.div}
      onPanEnd={settle}
      sx={[{ touchAction: 'none', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <ButtonBase
        aria-label={label}
        aria-expanded={expanded}
        onClick={onToggle}
        disableRipple
        data-kk-calendar-strip-grip
        sx={gripPaint(expanded)}
      >
        <Box component="span" aria-hidden data-kk-calendar-strip-grip-bar />
      </ButtonBase>
    </Box>
  );
};

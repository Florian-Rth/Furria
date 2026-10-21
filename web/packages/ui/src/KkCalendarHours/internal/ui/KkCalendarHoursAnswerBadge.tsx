import Box from '@mui/material/Box';
import { AnimatePresence, motion } from 'motion/react';
import type { FC } from 'react';

import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { hoursBadgePaint } from '../calendar-hours-paint';
import type { KkCalendarHoursBadge } from '../logic/calendar-hours-types';
import { KkCalendarHoursBadgeGlyph } from './KkCalendarHoursBadgeGlyph';

const { calendarHours, line } = kkTokens;
const GLYPH_SHARE = 0.78;
const HIDDEN_FACE = { rotateY: 90, opacity: 0 } as const;
const SHOWN_FACE = { rotateY: 0, opacity: 1 } as const;

interface KkCalendarHoursAnswerBadgeProps {
  badge: Exclude<KkCalendarHoursBadge, null>;
  reduced: boolean;
  size?: number;
  sx?: KkSx;
}

export const KkCalendarHoursAnswerBadge: FC<KkCalendarHoursAnswerBadgeProps> = ({
  badge,
  reduced,
  size = calendarHours.badge,
  sx,
}) => (
  <Box
    aria-hidden
    data-kk-calendar-hours-badge={badge}
    sx={[
      { perspective: '12rem', width: size, height: size, flexShrink: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <AnimatePresence initial={false} mode="wait">
      <Box
        key={badge}
        component={motion.span}
        initial={reduced ? SHOWN_FACE : HIDDEN_FACE}
        animate={SHOWN_FACE}
        exit={reduced ? SHOWN_FACE : HIDDEN_FACE}
        transition={{ duration: calendarHours.flipSeconds / 2, ease: 'easeOut' }}
        sx={(theme) => ({
          display: 'grid',
          placeItems: 'center',
          width: size,
          height: size,
          borderRadius: '50%',
          borderWidth: line.hair,
          borderStyle: 'solid',
          ...hoursBadgePaint(theme, badge),
        })}
      >
        <KkCalendarHoursBadgeGlyph badge={badge} size={Math.round(size * GLYPH_SHARE)} />
      </Box>
    </AnimatePresence>
  </Box>
);

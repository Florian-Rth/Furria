import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkCalendarHoursBadge } from '../logic/calendar-hours-types';

const PATHS: Record<Exclude<KkCalendarHoursBadge, null>, readonly string[]> = {
  yes: ['M3.5 8.5l2.9 2.9 6-6.6'],
  maybe: ['M5.6 6.1a2.45 2.45 0 1 1 3.55 2.2c-.75.4-1.15.95-1.15 1.75', 'M8 12.6v.05'],
  no: ['M4.4 4.4l7.2 7.2', 'M11.6 4.4l-7.2 7.2'],
  owed: ['M8 3.3v6', 'M8 12.6v.05'],
};

interface KkCalendarHoursBadgeGlyphProps {
  badge: Exclude<KkCalendarHoursBadge, null>;
  size: number;
}

export const KkCalendarHoursBadgeGlyph: FC<KkCalendarHoursBadgeGlyphProps> = ({ badge, size }) => (
  <Box
    component="svg"
    viewBox="0 0 16 16"
    width={size}
    height={size}
    aria-hidden
    sx={{
      display: 'block',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }}
  >
    {PATHS[badge].map((d) => (
      <path key={d} d={d} />
    ))}
  </Box>
);

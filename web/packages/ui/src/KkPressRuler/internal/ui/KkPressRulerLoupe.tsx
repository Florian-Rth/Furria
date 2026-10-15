import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkPressRulerLabels } from '../../press-ruler-data';
import { loupeLeftOf, loupeWindowOf } from '../logic/ruler-loupe';
import { LOUPE_LIFT, LOUPE_SPAN, LOUPE_TITLES, LOUPE_WIDTH } from '../logic/ruler-metrics';
import type { RulerProbe } from '../logic/use-ruler-probe';
import { KkPressRulerLoupePlot } from './KkPressRulerLoupePlot';

const LOUPE_INSET = 20;

const riseAbove = keyframes`from { opacity: 0; transform: translateY(calc(-100% + 8px)) scale(0.6); }`;
const riseBelow = keyframes`from { opacity: 0; transform: translateY(-8px) scale(0.6); }`;

const SIDES = {
  above: { lift: -LOUPE_LIFT, transform: 'translateY(-100%)', origin: '50% 100%', rise: riseAbove },
  below: { lift: LOUPE_LIFT / 2, transform: 'none', origin: '50% 0%', rise: riseBelow },
} as const;

interface KkPressRulerLoupeProps {
  probe: RulerProbe;
  today: number | null;
  labels: KkPressRulerLabels;
}

export const KkPressRulerLoupe: FC<KkPressRulerLoupeProps> = ({ probe, today, labels }) => {
  const { lane, column } = probe;
  const marks = column?.marks ?? [];
  const dayLabel = marks[0]?.dayLabel ?? lane.dayLabelAt(probe.share);
  const countLabel = marks.length === 0 ? labels.noMarks : labels.marksOf(marks.length);
  const left = `${probe.rulerLeft + loupeLeftOf(probe.x - probe.rulerLeft, probe.rulerWidth, LOUPE_WIDTH)}px`;
  const side = SIDES[probe.side];
  const top = `${probe.anchor + side.lift}px`;
  const window = loupeWindowOf(probe.share, LOUPE_SPAN);
  const laneToday = lane.present ? today : null;
  const hidden = marks.length - LOUPE_TITLES;

  const titles = marks.slice(0, LOUPE_TITLES).map((mark) => (
    <Typography
      key={mark.id}
      component="li"
      variant="caption"
      noWrap
      sx={{ color: 'text.secondary' }}
    >
      <Typography
        component="strong"
        variant="caption"
        sx={{ color: 'text.primary', fontWeight: 600 }}
      >
        {mark.title}
      </Typography>
    </Typography>
  ));

  const more =
    hidden > 0 ? (
      <Typography component="li" variant="caption" sx={{ color: 'text.secondary' }}>
        {labels.moreOf(hidden)}
      </Typography>
    ) : null;

  return (
    <Stack
      aria-live="polite"
      data-kk-press-ruler-loupe
      sx={(theme) => ({
        position: 'fixed',
        zIndex: theme.zIndex.tooltip,
        left,
        top,
        width: `${LOUPE_WIDTH}px`,
        gap: 0.5,
        px: 1.25,
        py: 1,
        transform: side.transform,
        transformOrigin: side.origin,
        pointerEvents: 'none',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: theme.shadows[8],
        '@media (prefers-reduced-motion: no-preference)': {
          animation: `${side.rise} 180ms cubic-bezier(.2,1.4,.4,1) both`,
        },
      })}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
          {dayLabel}
        </Typography>
        <Typography variant="caption" sx={{ lineHeight: 1.4, color: 'text.secondary' }}>
          {countLabel}
        </Typography>
      </Stack>
      <KkPressRulerLoupePlot
        lane={lane}
        window={window}
        focus={probe.share}
        today={laneToday}
        width={LOUPE_WIDTH - LOUPE_INSET}
      />
      <Box component="ul" sx={{ display: 'grid', gap: 0.25, m: 0, p: 0, listStyle: 'none' }}>
        {titles}
        {more}
      </Box>
    </Stack>
  );
};

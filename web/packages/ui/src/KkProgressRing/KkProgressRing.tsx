import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useId } from 'react';
import { stepFigures } from '../KkStatePill/state-paint';
import type { KkStepState } from '../KkStatePill/step-state';
import type { KkSx } from '../kk-sx';
import type { KkProgressRingPart } from './progress-ring';
import { RING_LENGTH, ringSegmentsOf } from './progress-ring';

export type KkProgressRingSize = 'small' | 'medium' | 'large';

const VIEW = 40;
const CENTER = VIEW / 2;
const RADIUS = 16;
const SEGMENT_GAP = 2.4;

const EXTENTS: Record<KkProgressRingSize, { xs: string; sm?: string }> = {
  small: { xs: '2.75rem' },
  medium: { xs: '3.5rem' },
  large: { xs: '3.75rem', sm: '4.5rem' },
};

const STROKES: Record<KkProgressRingSize, number> = { small: 4, medium: 4.25, large: 3.75 };

const VALUE_VARIANTS = { small: 'h4', medium: 'h4', large: 'h3' } as const;

const reveal = keyframes`
  from {
    stroke-dashoffset: ${RING_LENGTH};
  }
  to {
    stroke-dashoffset: 0;
  }
`;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const segmentInk = (theme: Theme, state: KkStepState): string => {
  switch (state) {
    case 'done':
      return palette(theme).text.primary;
    case 'overdue':
      return palette(theme).warning.main;
    case 'current':
      return palette(theme).primary.main;
    case 'open':
    case 'waiting':
    case 'off':
      return palette(theme).text.disabled;
  }
};

const ringPaint =
  (parts: readonly KkProgressRingPart[]) =>
  (theme: Theme): CSSObject => ({
    display: 'block',
    width: '100%',
    height: '100%',
    '& [data-ring-track]': { stroke: palette(theme).divider },
    '& [data-ring-reveal]': {
      animation: `${reveal} 820ms cubic-bezier(0.22, 0.61, 0.36, 1) both`,
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
    ...Object.fromEntries(
      parts.map((part) => [
        `& [data-ring-segment="${part.state}"]`,
        { stroke: segmentInk(theme, part.state) },
      ]),
    ),
  });

interface KkProgressRingProps {
  parts: readonly KkProgressRingPart[];
  label: string;
  value?: string;
  total?: string;
  size?: KkProgressRingSize;
  sx?: KkSx;
}

export const KkProgressRing: FC<KkProgressRingProps> = ({
  parts,
  label,
  value,
  total,
  size = 'medium',
  sx,
}) => {
  const maskId = useId();
  const stroke = STROKES[size];
  const segments = ringSegmentsOf(parts, SEGMENT_GAP).map((segment) => (
    <circle
      key={segment.state}
      data-ring-segment={segment.state}
      cx={CENTER}
      cy={CENTER}
      r={RADIUS}
      fill="none"
      strokeWidth={stroke}
      pathLength={RING_LENGTH}
      strokeDasharray={segment.dash}
      strokeDashoffset={segment.offset}
    />
  ));
  const totalLine =
    total === undefined ? null : (
      <Box
        component="span"
        sx={{
          ...stepFigures,
          typography: 'caption',
          fontWeight: 800,
          lineHeight: 1,
          color: 'text.secondary',
        }}
      >
        {total}
      </Box>
    );
  const center =
    value === undefined ? null : (
      <Stack
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          alignItems: 'center',
          justifyContent: 'center',
          rowGap: 0.25,
        }}
      >
        <Typography
          component="span"
          variant={VALUE_VARIANTS[size]}
          sx={{ ...stepFigures, lineHeight: 1 }}
        >
          {value}
        </Typography>
        {totalLine}
      </Stack>
    );

  return (
    <Box
      role="img"
      aria-label={label}
      data-kk-progress-ring
      sx={[
        {
          position: 'relative',
          flexShrink: 0,
          width: EXTENTS[size],
          height: EXTENTS[size],
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box component="svg" aria-hidden viewBox={`0 0 ${VIEW} ${VIEW}`} sx={ringPaint(parts)}>
        <defs>
          <mask id={maskId}>
            <circle
              data-ring-reveal
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="white"
              strokeWidth={stroke + 2}
              pathLength={RING_LENGTH}
              strokeDasharray={RING_LENGTH}
            />
          </mask>
        </defs>
        <circle
          data-ring-track
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          strokeWidth={stroke}
        />
        <g mask={`url(#${maskId})`} transform={`rotate(-90 ${CENTER} ${CENTER})`}>
          {segments}
        </g>
      </Box>
      {center}
    </Box>
  );
};

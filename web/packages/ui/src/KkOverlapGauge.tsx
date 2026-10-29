import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { redInk } from './internal/red-ink';
import { stepFigures } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { GAUGE_LENGTH, gaugeSegmentsOf } from './overlap-gauge';
import { kkTokens } from './tokens';

export type KkOverlapGaugeTone = 'ink' | 'accent';

const VIEW = 40;
const CENTER = VIEW / 2;
const RADIUS = 16;
const STROKE = 5;
const SEGMENT_GAP = 5;
const EXTENT = '2rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const gaugePaint =
  (tone: KkOverlapGaugeTone, quiet: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    flexShrink: 0,
    width: EXTENT,
    height: EXTENT,
    color: quiet ? 'text.disabled' : 'text.primary',
    '& [data-gauge-segment="false"]': { stroke: palette(theme).divider },
    '& [data-gauge-segment="true"]': {
      stroke: tone === 'accent' ? palette(theme).primary.main : palette(theme).text.primary,
      transition: 'stroke 200ms ease-out',
    },
    ...(tone === 'accent' && !quiet ? { '& [data-gauge-figure]': redInk(theme) } : {}),
  });

interface KkOverlapGaugeProps {
  shared: number;
  total: number;
  label: string;
  caption?: string | null;
  tone?: KkOverlapGaugeTone;
  sx?: KkSx;
}

export const KkOverlapGauge: FC<KkOverlapGaugeProps> = ({
  shared,
  total,
  label,
  caption = null,
  tone = 'ink',
  sx,
}) => {
  const quiet = shared === 0;
  const segments = gaugeSegmentsOf(shared, total, SEGMENT_GAP).map((segment) => (
    <circle
      key={segment.key}
      data-gauge-segment={segment.filled}
      cx={CENTER}
      cy={CENTER}
      r={RADIUS}
      fill="none"
      strokeWidth={STROKE}
      pathLength={GAUGE_LENGTH}
      strokeDasharray={segment.dash}
      strokeDashoffset={segment.offset}
      transform={`rotate(-90 ${CENTER} ${CENTER})`}
    />
  ));
  const captionLine =
    caption === null ? null : (
      <Box
        component="span"
        aria-hidden
        sx={{
          typography: 'caption',
          fontWeight: 700,
          lineHeight: 1.15,
          color: quiet ? 'text.disabled' : 'text.secondary',
          whiteSpace: 'nowrap',
        }}
      >
        {caption}
      </Box>
    );

  return (
    <Stack
      direction="row"
      role="img"
      aria-label={label}
      data-kk-overlap-gauge={quiet ? 'quiet' : tone}
      sx={[{ alignItems: 'center', gap: 0.75, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box component="span" sx={gaugePaint(tone, quiet)}>
        <Box
          component="svg"
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          aria-hidden
          sx={{ display: 'block', width: '100%', height: '100%' }}
        >
          {segments}
        </Box>
        <Stack
          component="span"
          aria-hidden
          data-gauge-figure
          sx={{
            ...stepFigures,
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
            typography: 'caption',
            fontFamily: kkTokens.font.display,
            lineHeight: 1,
          }}
        >
          {shared}
        </Stack>
      </Box>
      {captionLine}
    </Stack>
  );
};

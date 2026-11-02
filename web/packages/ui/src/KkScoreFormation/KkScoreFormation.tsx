import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { inkWash } from '../internal/ink-wash';
import { useReducedMotion } from '../internal/use-reduced-motion';
import { SCORE_FIGURES } from '../KkScoreTrack/internal/score-paint';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import type { KkScoreFormationSize } from './internal/formation-geometry';
import {
  boxShareOf,
  FORMATION_FRAMES,
  formationBoxOf,
  viewBoxOf,
} from './internal/formation-geometry';
import { KkScoreFormationMark } from './internal/ui/KkScoreFormationMark';
import { KkScoreFormationNumber } from './internal/ui/KkScoreFormationNumber';

export type { KkScoreFormationSize } from './internal/formation-geometry';

export interface KkScoreFormationDot {
  id: number;
  x: number;
  y: number;
  own: boolean;
  open: boolean;
  number: number;
  caption: string | null;
  fromX?: number;
  fromY?: number;
}

const WIDTHS: Record<KkScoreFormationSize, string> = {
  thumb: '3.25rem',
  card: '100%',
  stage: '100%',
};

const SIDE_LEGEND_FROM = '34rem';
const SIDE_LEGEND_WIDTH = '8rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkScoreFormationProps {
  label: string;
  widthMetres: number;
  depthMetres: number;
  dots: readonly KkScoreFormationDot[];
  size: KkScoreFormationSize;
  audienceLabel?: string;
  openLabel?: string;
  entranceDelay?: number | null;
  sx?: KkSx;
}

export const KkScoreFormation: FC<KkScoreFormationProps> = ({
  label,
  widthMetres,
  depthMetres,
  dots,
  size,
  audienceLabel,
  openLabel,
  entranceDelay = null,
  sx,
}) => {
  const reduced = useReducedMotion();
  const frame = FORMATION_FRAMES[size];
  const box = formationBoxOf(widthMetres, depthMetres, frame);
  const stage = size === 'stage';
  const described = size !== 'thumb';
  const ordered = dots.toSorted((left, right) => Number(left.own) - Number(right.own));
  const marks = ordered.map((dot) => {
    const cx = dot.x * widthMetres;
    const cy = dot.y * depthMetres;
    const from =
      entranceDelay === null || reduced || dot.fromX === undefined || dot.fromY === undefined
        ? null
        : {
            dx: dot.fromX * widthMetres - cx,
            dy: dot.fromY * depthMetres - cy,
            delay: entranceDelay,
          };

    return (
      <KkScoreFormationMark
        key={dot.id}
        cx={cx}
        cy={cy}
        radius={frame.radius}
        halo={frame.halo}
        own={dot.own}
        open={dot.open}
        from={from}
      />
    );
  });
  const numbers = stage
    ? dots.map((dot) => (
        <KkScoreFormationNumber
          key={dot.id}
          left={boxShareOf(dot.x * widthMetres, frame.pad, box.width)}
          top={boxShareOf(dot.y * depthMetres, frame.pad, box.height)}
          number={dot.number}
          own={dot.own}
          open={dot.open}
        />
      ))
    : null;
  const centre = stage ? (
    <line
      x1={widthMetres / 2}
      y1={0}
      x2={widthMetres / 2}
      y2={depthMetres}
      data-kk-formation-centre
    />
  ) : null;
  const audience =
    stage && audienceLabel !== undefined ? (
      <Box
        component="span"
        sx={{
          textAlign: 'center',
          typography: 'caption',
          fontWeight: 800,
          letterSpacing: kkTokens.type.tracking.label,
          textTransform: 'uppercase',
          color: 'text.secondary',
          lineHeight: 1.2,
        }}
      >
        {audienceLabel}
      </Box>
    ) : null;
  const legendItems = dots
    .toSorted((left, right) => left.number - right.number)
    .map((dot) => (
      <Stack
        key={dot.id}
        component="li"
        direction="row"
        data-own={dot.own}
        data-open={dot.open}
        sx={(theme) => ({
          alignItems: 'baseline',
          gap: 0.5,
          minWidth: 0,
          typography: 'caption',
          fontWeight: 700,
          color: 'text.primary',
          '&[data-open="true"]': { color: 'text.secondary' },
          '&[data-own="true"]': { color: palette(theme).primary.main, fontWeight: 900 },
        })}
      >
        <Box
          component="span"
          sx={{
            fontFamily: kkTokens.font.display,
            minWidth: '1.25rem',
            textAlign: 'right',
            ...SCORE_FIGURES,
          }}
        >
          {dot.number}
        </Box>
        <Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          {dot.caption ?? openLabel}
        </Box>
      </Stack>
    ));
  const legend = stage ? (
    <Box
      component="ol"
      data-kk-formation-legend
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(5.5rem, 1fr))',
        columnGap: 1,
        rowGap: 0.25,
      }}
    >
      {legendItems}
    </Box>
  ) : null;

  const floor = (
    <Box
      component="svg"
      viewBox={viewBoxOf(box, frame)}
      aria-hidden
      sx={(theme) => ({
        display: 'block',
        width: '100%',
        height: 'auto',
        aspectRatio: `${box.width} / ${box.height}`,
        '& [data-kk-formation-floor]': {
          fill: inkWash(theme, size === 'thumb' ? '7%' : '4%'),
          stroke: palette(theme).divider,
          strokeWidth: frame.edge,
        },
        '& [data-kk-formation-front]': {
          stroke: palette(theme).text.primary,
          strokeWidth: frame.front,
          strokeLinecap: 'round',
        },
        '& [data-kk-formation-centre]': {
          stroke: palette(theme).divider,
          strokeWidth: frame.edge,
          strokeDasharray: '0.25 0.25',
        },
        '& [data-kk-formation-dot]': { fill: palette(theme).text.primary },
        '& [data-kk-formation-dot][data-open="true"]': {
          fill: size === 'thumb' ? palette(theme).text.disabled : palette(theme).background.paper,
          stroke: size === 'thumb' ? 'none' : palette(theme).text.secondary,
          strokeWidth: frame.edge * 1.5,
          strokeDasharray: '0.12 0.1',
        },
        '& [data-kk-formation-dot][data-own="true"]': { fill: palette(theme).primary.main },
        '& [data-kk-formation-halo]': { fill: palette(theme).primary.main, opacity: 0.18 },
      })}
    >
      <rect
        x={0}
        y={0}
        width={widthMetres}
        height={depthMetres}
        rx={frame.pad / 2}
        data-kk-formation-floor
      />
      {centre}
      <line x1={0} y1={depthMetres} x2={widthMetres} y2={depthMetres} data-kk-formation-front />
      {marks}
    </Box>
  );

  return (
    <Box
      aria-hidden={described ? undefined : true}
      data-kk-score-formation={size}
      sx={[
        { width: WIDTHS[size], flexShrink: 0, minWidth: 0, containerType: 'inline-size' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 1,
          alignItems: 'start',
          [`@container (min-width: ${SIDE_LEGEND_FROM})`]: {
            gridTemplateColumns: `minmax(0, 1fr) ${SIDE_LEGEND_WIDTH}`,
            '& [data-kk-formation-legend]': { gridTemplateColumns: 'minmax(0, 1fr)' },
          },
        }}
      >
        <Stack sx={{ gap: 0.5, minWidth: 0 }}>
          <Box
            role={described ? 'img' : undefined}
            aria-label={described ? label : undefined}
            sx={{ position: 'relative', width: '100%' }}
          >
            {floor}
            {numbers}
          </Box>
          {audience}
        </Stack>
        {legend}
      </Box>
    </Box>
  );
};

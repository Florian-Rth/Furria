import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../tokens';
import type { KkStudioFDot } from './studio-f-types';

const DOT_RADIUS = 0.3;
const OWN_RADIUS = 0.4;
const NOTCH = 'M -0.13 0.21 L 0 0.36 L 0.13 0.21';
const LABEL_SCALE = 0.026;
const OWN_LABEL_SCALE = 0.032;
const OPEN_DASH = '0.12 0.09';
const STROKE = 0.05;

const halo = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  75% { transform: scale(2.3); opacity: 0; }
  100% { transform: scale(2.3); opacity: 0; }
`;

const dotsPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;
  const goldInk = theme.applyStyles('dark', { fill: kkTokens.color.dark.goldInk });

  return {
    '& [data-dot="cast"] circle': { fill: palette.text.primary, opacity: 0.86 },
    '& [data-dot="cast"] text': { fill: palette.background.paper },
    '& [data-dot="cast"] path': { stroke: palette.text.primary, opacity: 0.86 },
    '& [data-dot="open"] circle': {
      fill: 'transparent',
      stroke: palette.warning.main,
      strokeWidth: STROKE,
      strokeDasharray: OPEN_DASH,
    },
    '& [data-dot="open"] text': { fill: kkTokens.color.light.goldInk, ...goldInk },
    '& [data-dot="open"] path': { display: 'none' },
    '& [data-dot="own"] circle:not([data-dot-halo])': { fill: palette.primary.main },
    '& [data-dot="own"] text': { fill: palette.primary.contrastText },
    '& [data-dot="own"] path': { stroke: palette.primary.main },
    '& [data-dot-halo]': {
      fill: 'none',
      stroke: palette.primary.main,
      strokeWidth: STROKE,
      transformBox: 'fill-box',
      transformOrigin: 'center',
      animation: `${halo} 1.8s ease-out infinite`,
    },
    '& path': { fill: 'none', strokeWidth: STROKE * 1.6, strokeLinecap: 'round' },
    '& text': {
      typography: 'caption',
      fontWeight: 800,
      dominantBaseline: 'central',
      textAnchor: 'middle',
    },
  };
};

interface KkStudioFStageDotsProps {
  dots: readonly KkStudioFDot[];
}

export const KkStudioFStageDots: FC<KkStudioFStageDotsProps> = ({ dots }) => {
  const marks = dots.map((dot) => {
    const own = dot.kind === 'own';
    const radius = own ? OWN_RADIUS : DOT_RADIUS;
    const place = `translate(${dot.x} ${dot.y})`;
    const turn = `rotate(${dot.rotation ?? 0}) translate(0 ${radius - DOT_RADIUS})`;
    const facing = dot.rotation === null ? null : <path d={NOTCH} transform={turn} />;
    const ring = own ? <circle data-dot-halo r={radius} /> : null;
    const labelScale = `scale(${own ? OWN_LABEL_SCALE : LABEL_SCALE})`;

    return (
      <g key={dot.id} data-dot={dot.kind} transform={place}>
        {ring}
        {facing}
        <circle r={radius} />
        <g transform={labelScale}>
          <text>{dot.number}</text>
        </g>
      </g>
    );
  });

  return (
    <Box component="g" aria-hidden data-kk-studio-f-dots sx={dotsPaint}>
      {marks}
    </Box>
  );
};

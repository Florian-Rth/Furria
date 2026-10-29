import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { KkStageArea } from '../KkStageArea';
import type { KkSx } from '../kk-sx';
import type { KkStudioCDot } from './studio-c-types';

const DOT_RADIUS = 0.3;
const OWN_RADIUS = 0.36;
const NOTCH = 'M -0.12 0.2 L 0 0.34 L 0.12 0.2';
const LABEL_SCALE = 'scale(0.026)';
const OPEN_DASH = '0.12 0.09';
const STROKE = 0.05;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.55; }
  80% { transform: scale(2.1); opacity: 0; }
  100% { transform: scale(2.1); opacity: 0; }
`;

const layerPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  return {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    overflow: 'visible',
    pointerEvents: 'none',
    '& [data-dot="cast"] circle': { fill: palette.text.primary },
    '& [data-dot="cast"] text': { fill: palette.background.paper },
    '& [data-dot="cast"] path': { stroke: palette.text.primary },
    '& [data-dot="open"] circle': {
      fill: 'transparent',
      stroke: palette.warning.main,
      strokeWidth: STROKE,
      strokeDasharray: OPEN_DASH,
    },
    '& [data-dot="open"] text': { fill: palette.warning.main },
    '& [data-dot="open"] path': { display: 'none' },
    '& [data-dot="own"] circle:not([data-dot-pulse])': { fill: palette.primary.main },
    '& [data-dot="own"] text': { fill: palette.primary.contrastText },
    '& [data-dot="own"] path': { stroke: palette.primary.main },
    '& [data-dot-pulse]': {
      fill: 'none',
      stroke: palette.primary.main,
      strokeWidth: STROKE,
      transformBox: 'fill-box',
      transformOrigin: 'center',
      animation: `${pulse} 1.6s ease-out infinite`,
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

interface KkStudioCStageProps {
  widthMetres: number;
  depthMetres: number;
  artworkSvg: string | null;
  label: string;
  dots: readonly KkStudioCDot[];
  sx?: KkSx;
}

export const KkStudioCStage: FC<KkStudioCStageProps> = ({
  widthMetres,
  depthMetres,
  artworkSvg,
  label,
  dots,
  sx,
}) => {
  const viewBox = `0 0 ${widthMetres} ${depthMetres}`;
  const marks = dots.map((dot) => {
    const radius = dot.kind === 'own' ? OWN_RADIUS : DOT_RADIUS;
    const place = `translate(${dot.x} ${dot.y})`;
    const turn = `rotate(${dot.rotation ?? 0}) translate(0 ${radius - DOT_RADIUS})`;
    const facing = dot.rotation === null ? null : <path d={NOTCH} transform={turn} />;
    const halo = dot.kind === 'own' ? <circle data-dot-pulse r={radius} /> : null;

    return (
      <g key={dot.id} data-dot={dot.kind} transform={place}>
        {halo}
        {facing}
        <circle r={radius} />
        <g transform={LABEL_SCALE}>
          <text>{dot.number}</text>
        </g>
      </g>
    );
  });

  return (
    <KkStageArea
      widthMetres={widthMetres}
      depthMetres={depthMetres}
      artworkSvg={artworkSvg}
      label={label}
      sx={sx}
    >
      <Box component="svg" aria-hidden viewBox={viewBox} sx={layerPaint}>
        {marks}
      </Box>
    </KkStageArea>
  );
};

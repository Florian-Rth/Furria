import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { stretchedSvgSourceOf } from '../internal/stretched-svg-source';
import { kkTokens } from '../tokens';
import type { KkStudioFFront } from './studio-f-types';

const SIDE_MARGIN = 0.5;
const FRONT_MARGIN = 1.1;
const FRONT_LINE = 0.09;
const LABEL_GAP = 0.55;
const LABEL_SCALE = 0.03;

const stagePaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  return {
    display: 'block',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    '& [data-kk-studio-f-floor]': {
      fill: palette.background.default,
      stroke: palette.divider,
      strokeWidth: 0.04,
    },
    '& [data-kk-studio-f-front]': { fill: palette.text.primary },
    '& [data-kk-studio-f-front-label]': {
      fill: palette.text.secondary,
      typography: 'caption',
      fontWeight: 800,
      letterSpacing: kkTokens.type.tracking.label,
      textTransform: 'uppercase',
      textAnchor: 'middle',
      dominantBaseline: 'central',
    },
  };
};

interface KkStudioFStageProps extends PropsWithChildren {
  widthMetres: number;
  depthMetres: number;
  artworkSvg: string | null;
  front: KkStudioFFront;
  frontLabel: string;
  label: string;
}

export const KkStudioFStage: FC<KkStudioFStageProps> = ({
  widthMetres,
  depthMetres,
  artworkSvg,
  front,
  frontLabel,
  label,
  children,
}) => {
  const top = front === 'top' ? FRONT_MARGIN : SIDE_MARGIN;
  const bottom = front === 'top' ? SIDE_MARGIN : FRONT_MARGIN;
  const viewBox = `${-SIDE_MARGIN} ${-top} ${widthMetres + SIDE_MARGIN * 2} ${depthMetres + top + bottom}`;
  const source = stretchedSvgSourceOf(artworkSvg);
  const artworkTurn =
    front === 'top' ? `rotate(180 ${widthMetres / 2} ${depthMetres / 2})` : undefined;
  const artwork =
    source === null ? null : (
      <image
        href={source}
        x={0}
        y={0}
        width={widthMetres}
        height={depthMetres}
        preserveAspectRatio="none"
        transform={artworkTurn}
      />
    );
  const frontY = front === 'top' ? -FRONT_LINE : depthMetres;
  const labelY = front === 'top' ? -LABEL_GAP : depthMetres + LABEL_GAP;
  const labelPlace = `translate(${widthMetres / 2} ${labelY}) scale(${LABEL_SCALE})`;

  return (
    <Box
      component="svg"
      role="img"
      aria-label={label}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      data-kk-studio-f-stage={front}
      sx={stagePaint}
    >
      <rect data-kk-studio-f-floor x={0} y={0} width={widthMetres} height={depthMetres} rx={0.12} />
      {artwork}
      <rect data-kk-studio-f-front x={0} y={frontY} width={widthMetres} height={FRONT_LINE} />
      <g transform={labelPlace}>
        <text data-kk-studio-f-front-label>{frontLabel}</text>
      </g>
      {children}
    </Box>
  );
};

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { stretchedSvgSourceOf } from '../internal/stretched-svg-source';
import { KkPhoto } from '../KkPhoto';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { KkStudioBStageDot } from './internal/KkStudioBStageDot';
import { STAGE_TURN } from './internal/studio-b-stage-paint';
import type { KkStudioBDot } from './studio-b-dot';

export type { KkStudioBDot, KkStudioBDotRole } from './studio-b-dot';

const ARTWORK_LAYER = { position: 'absolute', inset: 0, pointerEvents: 'none' } as const;

const floorPaint =
  (widthMetres: number, depthMetres: number, gridded: boolean) =>
  (theme: Theme): CSSObject => {
    const line = (theme.vars ?? theme).palette.divider;

    return {
      position: 'absolute',
      inset: 0,
      backgroundColor: (theme.vars ?? theme).palette.background.default,
      borderStyle: 'solid',
      borderColor: line,
      borderWidth: kkTokens.line.hair,
      borderBottomColor: (theme.vars ?? theme).palette.text.primary,
      borderBottomWidth: kkTokens.line.page,
      backgroundImage: gridded
        ? `linear-gradient(to right, ${line} ${kkTokens.line.hair}px, transparent ${kkTokens.line.hair}px), linear-gradient(to bottom, ${line} ${kkTokens.line.hair}px, transparent ${kkTokens.line.hair}px)`
        : 'none',
      backgroundSize: `${100 / widthMetres}% ${100 / depthMetres}%`,
      backgroundPosition: 'center center',
    };
  };

const CENTRE_FRONT = {
  position: 'absolute',
  left: '50%',
  bottom: 0,
  width: kkTokens.line.section,
  height: '4%',
  bgcolor: 'text.primary',
  transform: 'translateX(-50%)',
} as const;

const FRONT_LABEL = {
  typography: 'caption',
  fontWeight: 800,
  letterSpacing: kkTokens.type.tracking.eyebrow,
  textTransform: 'uppercase',
  color: 'text.secondary',
  textAlign: 'center',
  lineHeight: 1,
} as const;

interface KkStudioBStageProps {
  widthMetres: number;
  depthMetres: number;
  artworkSvg: string | null;
  dots: readonly KkStudioBDot[];
  turned: boolean;
  label: string;
  frontLabel: string;
  sx?: KkSx;
}

export const KkStudioBStage: FC<KkStudioBStageProps> = ({
  widthMetres,
  depthMetres,
  artworkSvg,
  dots,
  turned,
  label,
  frontLabel,
  sx,
}) => {
  const source = stretchedSvgSourceOf(artworkSvg);
  const artwork =
    source === null ? null : (
      <KkPhoto alt="" image={{ src: source }} fit="fill" fill priority sx={ARTWORK_LAYER} />
    );
  const placed = dots.map((dot) => (
    <KkStudioBStageDot key={dot.spotId} dot={dot} turned={turned} />
  ));

  return (
    <Stack
      data-kk-studio-b-stage
      sx={[
        { gap: 0.75, minWidth: 0, flexDirection: turned ? 'column-reverse' : 'column' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        role="img"
        aria-label={label}
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: `${widthMetres} / ${depthMetres}`,
          userSelect: 'none',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            transform: turned ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: STAGE_TURN,
          }}
        >
          <Box sx={floorPaint(widthMetres, depthMetres, source === null)}>{artwork}</Box>
          <Box aria-hidden sx={CENTRE_FRONT} />
          {placed}
        </Box>
      </Box>
      <Box aria-hidden sx={FRONT_LABEL}>
        {frontLabel}
      </Box>
    </Stack>
  );
};

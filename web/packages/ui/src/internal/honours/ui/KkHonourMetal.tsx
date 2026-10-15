import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { arcPath, circlePath } from '../honour-geometry';
import type { LapState } from '../honour-laps';
import type { HonourMotion } from '../honour-motion';
import { dipStagingOf, glintCueOf, pieceCueOf, VIEW_BOX_ORIGIN } from '../honour-motion';
import { BARE_TRACK_SHARE, bareTrackPaint } from '../honour-paint';
import { lapPiecesOf } from '../honour-pieces';
import { KkHonourGlint } from './KkHonourGlint';
import { KkHonourPiece } from './KkHonourPiece';

const GLINT_ARC = { startDegrees: 0, endDegrees: 55 } as const;
const GLINT_OVERHANG = 2;

interface KkHonourMetalProps {
  box: number;
  radius: number;
  stroke: number;
  gap: number;
  lap: LapState;
  bareTrack: boolean;
  prefix: string;
  play: HonourMotion;
}

export const KkHonourMetal: FC<KkHonourMetalProps> = ({
  box,
  radius,
  stroke,
  gap,
  lap,
  bareTrack,
  prefix,
  play,
}) => {
  const center = box / 2;
  const pieces = lapPiecesOf(lap, center, radius, gap);
  const struck = lap.kind === 'none' ? 0 : lap.struck;
  const isBand = lap.kind === 'closed';
  const litPaths = pieces.filter((piece) => piece.face.kind === 'metal').map((piece) => piece.path);
  const glintDelay = litPaths.length === 0 ? null : glintCueOf(play, struck);
  const glintPath = arcPath(center, radius, GLINT_ARC);
  const bareWidth = stroke * BARE_TRACK_SHARE;
  const barePath = circlePath(center, radius);
  const glintWidth = stroke + GLINT_OVERHANG;
  const dip = dipStagingOf(play);

  const drawn = pieces.map((piece) => {
    const pieceCue = pieceCueOf(play, piece.order, struck, piece.face.kind === 'metal', isBand);

    return (
      <KkHonourPiece
        key={piece.key}
        path={piece.path}
        face={piece.face}
        strokeWidth={stroke}
        prefix={prefix}
        cue={pieceCue}
      />
    );
  });

  const bare =
    lap.kind === 'none' && bareTrack ? (
      <Box component="path" d={barePath} fill="none" strokeWidth={bareWidth} sx={bareTrackPaint} />
    ) : null;

  const glint =
    glintDelay === null ? null : (
      <KkHonourGlint
        prefix={prefix}
        box={box}
        litPaths={litPaths}
        litWidth={stroke}
        path={glintPath}
        strokeWidth={glintWidth}
        delay={glintDelay}
      />
    );

  return (
    <motion.g
      initial={dip.initial}
      animate={dip.animate}
      transition={dip.transition}
      style={VIEW_BOX_ORIGIN}
    >
      {bare}
      {drawn}
      {glint}
    </motion.g>
  );
};

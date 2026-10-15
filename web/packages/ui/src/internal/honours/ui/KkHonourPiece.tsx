import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { enamelOf, gradientOf } from '../honour-laps';
import type { PieceCue } from '../honour-motion';
import { FILL_BOX_ORIGIN, pieceStagingOf } from '../honour-motion';
import { ENAMEL_SHARE, enamelPaint, trackPaint, UNDER_OPACITY } from '../honour-paint';
import type { PieceFace } from '../honour-pieces';
import { metalFillOf } from '../svg-id';

interface KkHonourPieceProps {
  path: string;
  face: PieceFace;
  strokeWidth: number;
  prefix: string;
  cue: PieceCue;
}

export const KkHonourPiece: FC<KkHonourPieceProps> = ({ path, face, strokeWidth, prefix, cue }) => {
  if (face.kind === 'track') {
    return <Box component="path" d={path} fill="none" strokeWidth={strokeWidth} sx={trackPaint} />;
  }

  const enamel = enamelOf(face.metal);
  const stroke = metalFillOf(prefix, gradientOf(face.metal));
  const opacity = face.kind === 'under' ? UNDER_OPACITY : 1;
  const staging = pieceStagingOf(cue);
  const enamelWidth = strokeWidth * ENAMEL_SHARE;
  const enamelSx = enamel === null ? null : enamelPaint(enamel);
  const enamelLine =
    enamelSx === null ? null : (
      <Box component="path" d={path} fill="none" strokeWidth={enamelWidth} sx={enamelSx} />
    );

  return (
    <g opacity={opacity}>
      <motion.g
        initial={staging.initial}
        animate={staging.animate}
        transition={staging.transition}
        style={FILL_BOX_ORIGIN}
      >
        <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        {enamelLine}
      </motion.g>
    </g>
  );
};

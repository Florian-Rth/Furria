import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import type { GlassBeadRole } from '../logic/glass-drop-paths';
import { beadPathOf } from '../logic/glass-drop-paths';
import type {
  GlassDropDirection,
  GlassDropGlyph as GlassDropGlyphName,
} from '../logic/glass-drop-plan';
import { GlassDropGlyph } from './GlassDropGlyph';
import { GlassDropSkin } from './GlassDropSkin';

const BEAD_STYLE = { position: 'absolute', inset: 0 } as const;
const GEL: Transition['ease'] = [0.33, 0, 0.2, 1];

interface GlassDropBeadProps {
  part: GlassBeadRole;
  glyph: GlassDropGlyphName;
  direction: GlassDropDirection;
}

export const GlassDropBead: FC<GlassDropBeadProps> = ({ part, glyph, direction }) => {
  const path = beadPathOf(part, direction);
  const initial = {
    y: path.y[0],
    scaleX: path.scaleX[0],
    scaleY: path.scaleY[0],
    opacity: path.opacity[0],
  };
  const animate = { y: path.y, scaleX: path.scaleX, scaleY: path.scaleY, opacity: path.opacity };
  const transition = { duration: path.duration, delay: path.delay, times: path.times, ease: GEL };

  return (
    <motion.div
      data-kk-glass-drop-bead={part}
      style={BEAD_STYLE}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      <GlassDropSkin part={part} />
      <GlassDropGlyph glyph={glyph} />
    </motion.div>
  );
};

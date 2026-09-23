import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import type { FallblattCell, FallblattWindow } from '../logic/fallblatt-flaps';
import {
  BOTTOM_HALF_CLIP,
  TOP_HALF_CLIP,
  useFallblattFlapMotion,
} from '../logic/use-fallblatt-flap-motion';
import { FallblattGlyph } from './FallblattGlyph';
import { FallblattLeaf } from './FallblattLeaf';
import { FallblattShade } from './FallblattShade';

interface FallblattFlapProps {
  cell: FallblattCell;
  window: FallblattWindow;
  progress: MotionValue<number>;
  top: number;
  height: number;
}

export const FallblattFlap: FC<FallblattFlapProps> = ({ cell, window, progress, top, height }) => {
  const flap = useFallblattFlapMotion(progress, window, cell);

  return (
    <motion.span
      style={{ position: 'absolute', left: 0, top, width: cell.width, height, x: flap.offset }}
    >
      <FallblattLeaf
        clip={flap.revealClip}
        presence={flap.presence}
        inverse={<FallblattGlyph tone="inverse">{cell.to}</FallblattGlyph>}
      >
        <FallblattGlyph>{cell.to}</FallblattGlyph>
      </FallblattLeaf>
      <FallblattLeaf
        clip={flap.coverClip}
        presence={flap.presence}
        inverse={<FallblattGlyph tone="inverse">{cell.from}</FallblattGlyph>}
      >
        <FallblattGlyph>{cell.from}</FallblattGlyph>
      </FallblattLeaf>
      <FallblattLeaf
        clip={TOP_HALF_CLIP}
        presence={flap.presence}
        inverse={<FallblattGlyph tone="inverse">{cell.from}</FallblattGlyph>}
        shade={<FallblattShade shade={flap.fallShade} />}
        rotate={flap.fall}
        opacity={flap.fallOpacity}
      >
        <FallblattGlyph>{cell.from}</FallblattGlyph>
      </FallblattLeaf>
      <FallblattLeaf
        clip={BOTTOM_HALF_CLIP}
        presence={flap.presence}
        inverse={<FallblattGlyph tone="inverse">{cell.to}</FallblattGlyph>}
        shade={<FallblattShade shade={flap.landShade} />}
        rotate={flap.land}
        opacity={flap.landOpacity}
      >
        <FallblattGlyph>{cell.to}</FallblattGlyph>
      </FallblattLeaf>
    </motion.span>
  );
};

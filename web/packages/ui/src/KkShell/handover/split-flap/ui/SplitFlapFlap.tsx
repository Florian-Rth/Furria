import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { FlapGlyph } from '../../../../internal/flap/FlapGlyph';
import { FlapLeaf } from '../../../../internal/flap/FlapLeaf';
import { FlapShade } from '../../../../internal/flap/FlapShade';
import { BOTTOM_HALF_CLIP, TOP_HALF_CLIP } from '../../../../internal/flap/flap-pose';
import type { SplitFlapCell, SplitFlapWindow } from '../logic/split-flap-flaps';
import { useSplitFlapFlapMotion } from '../logic/use-split-flap-flap-motion';

interface SplitFlapFlapProps {
  cell: SplitFlapCell;
  window: SplitFlapWindow;
  progress: MotionValue<number>;
  top: number;
  height: number;
}

export const SplitFlapFlap: FC<SplitFlapFlapProps> = ({ cell, window, progress, top, height }) => {
  const flap = useSplitFlapFlapMotion(progress, window, cell);

  return (
    <motion.span
      style={{ position: 'absolute', left: 0, top, width: cell.width, height, x: flap.offset }}
    >
      <FlapLeaf
        clip={flap.revealClip}
        presence={flap.presence}
        inverse={<FlapGlyph tone="inverse">{cell.to}</FlapGlyph>}
      >
        <FlapGlyph>{cell.to}</FlapGlyph>
      </FlapLeaf>
      <FlapLeaf
        clip={flap.coverClip}
        presence={flap.presence}
        inverse={<FlapGlyph tone="inverse">{cell.from}</FlapGlyph>}
      >
        <FlapGlyph>{cell.from}</FlapGlyph>
      </FlapLeaf>
      <FlapLeaf
        clip={TOP_HALF_CLIP}
        presence={flap.presence}
        inverse={<FlapGlyph tone="inverse">{cell.from}</FlapGlyph>}
        shade={<FlapShade shade={flap.fallShade} />}
        rotate={flap.fall}
        opacity={flap.fallOpacity}
      >
        <FlapGlyph>{cell.from}</FlapGlyph>
      </FlapLeaf>
      <FlapLeaf
        clip={BOTTOM_HALF_CLIP}
        presence={flap.presence}
        inverse={<FlapGlyph tone="inverse">{cell.to}</FlapGlyph>}
        shade={<FlapShade shade={flap.landShade} />}
        rotate={flap.land}
        opacity={flap.landOpacity}
      >
        <FlapGlyph>{cell.to}</FlapGlyph>
      </FlapLeaf>
    </motion.span>
  );
};

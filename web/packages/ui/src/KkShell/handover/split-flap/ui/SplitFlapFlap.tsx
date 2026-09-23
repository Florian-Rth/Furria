import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import type { SplitFlapCell, SplitFlapWindow } from '../logic/split-flap-flaps';
import {
  BOTTOM_HALF_CLIP,
  TOP_HALF_CLIP,
  useSplitFlapFlapMotion,
} from '../logic/use-split-flap-flap-motion';
import { SplitFlapGlyph } from './SplitFlapGlyph';
import { SplitFlapLeaf } from './SplitFlapLeaf';
import { SplitFlapShade } from './SplitFlapShade';

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
      <SplitFlapLeaf
        clip={flap.revealClip}
        presence={flap.presence}
        inverse={<SplitFlapGlyph tone="inverse">{cell.to}</SplitFlapGlyph>}
      >
        <SplitFlapGlyph>{cell.to}</SplitFlapGlyph>
      </SplitFlapLeaf>
      <SplitFlapLeaf
        clip={flap.coverClip}
        presence={flap.presence}
        inverse={<SplitFlapGlyph tone="inverse">{cell.from}</SplitFlapGlyph>}
      >
        <SplitFlapGlyph>{cell.from}</SplitFlapGlyph>
      </SplitFlapLeaf>
      <SplitFlapLeaf
        clip={TOP_HALF_CLIP}
        presence={flap.presence}
        inverse={<SplitFlapGlyph tone="inverse">{cell.from}</SplitFlapGlyph>}
        shade={<SplitFlapShade shade={flap.fallShade} />}
        rotate={flap.fall}
        opacity={flap.fallOpacity}
      >
        <SplitFlapGlyph>{cell.from}</SplitFlapGlyph>
      </SplitFlapLeaf>
      <SplitFlapLeaf
        clip={BOTTOM_HALF_CLIP}
        presence={flap.presence}
        inverse={<SplitFlapGlyph tone="inverse">{cell.to}</SplitFlapGlyph>}
        shade={<SplitFlapShade shade={flap.landShade} />}
        rotate={flap.land}
        opacity={flap.landOpacity}
      >
        <SplitFlapGlyph>{cell.to}</SplitFlapGlyph>
      </SplitFlapLeaf>
    </motion.span>
  );
};

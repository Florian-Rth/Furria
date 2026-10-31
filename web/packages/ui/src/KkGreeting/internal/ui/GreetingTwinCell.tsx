import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { FlapGlyphVariant } from '../../../internal/flap/FlapGlyph';
import { FlapGlyph } from '../../../internal/flap/FlapGlyph';
import { FlapLeaf } from '../../../internal/flap/FlapLeaf';
import { FlapShade } from '../../../internal/flap/FlapShade';
import type { FlapTileTone } from '../../../internal/flap/FlapTile';
import { BOTTOM_HALF_CLIP, TOP_HALF_CLIP } from '../../../internal/flap/flap-pose';
import type { FlapTileFit } from '../../../internal/flap/flap-tile-bounds';
import { useFlapLeaf } from '../../../internal/flap/use-flap-leaf';
import { trackPoseOf } from '../logic/flap-keyframes';
import type { TwinCell } from '../logic/greeting-twin';
import { useTwinFaces } from '../logic/use-twin-faces';

const LINE_FIT: FlapTileFit = 'line';

interface GreetingTwinCellProps {
  cell: TwinCell;
  tone: FlapTileTone;
  clock: MotionValue<number>;
  glyph: FlapGlyphVariant;
}

export const GreetingTwinCell: FC<GreetingTwinCellProps> = ({ cell, tone, clock, glyph }) => {
  const flap = useFlapLeaf(clock, trackPoseOf(cell.track));
  const faces = useTwinFaces(clock, cell.track, cell.faces);
  const tileInk = tone === 'gold' ? 'onGold' : 'inverse';
  const box: CSSProperties = {
    position: 'absolute',
    left: cell.box.left,
    top: cell.box.top,
    width: cell.box.width,
    height: cell.box.height,
  };

  const fromGlyph = (
    <FlapGlyph variant={glyph} tone={cell.glyph}>
      <motion.span>{faces.fromFace}</motion.span>
    </FlapGlyph>
  );
  const fromOnTile = (
    <FlapGlyph variant={glyph} tone={tileInk}>
      <motion.span>{faces.fromFace}</motion.span>
    </FlapGlyph>
  );
  const toGlyph = (
    <FlapGlyph variant={glyph} tone={cell.glyph}>
      <motion.span>{faces.toFace}</motion.span>
    </FlapGlyph>
  );
  const toOnTile = (
    <FlapGlyph variant={glyph} tone={tileInk}>
      <motion.span>{faces.toFace}</motion.span>
    </FlapGlyph>
  );

  return (
    <span style={box}>
      <FlapLeaf
        clip={flap.revealClip}
        presence={flap.presence}
        tone={tone}
        fit={LINE_FIT}
        inverse={toOnTile}
      >
        {toGlyph}
      </FlapLeaf>
      <FlapLeaf
        clip={flap.coverClip}
        presence={flap.presence}
        tone={tone}
        fit={LINE_FIT}
        inverse={fromOnTile}
      >
        {fromGlyph}
      </FlapLeaf>
      <FlapLeaf
        clip={TOP_HALF_CLIP}
        presence={flap.presence}
        tone={tone}
        fit={LINE_FIT}
        inverse={fromOnTile}
        shade={<FlapShade shade={flap.fallShade} fit={LINE_FIT} />}
        rotate={flap.fall}
        opacity={flap.fallOpacity}
      >
        {fromGlyph}
      </FlapLeaf>
      <FlapLeaf
        clip={BOTTOM_HALF_CLIP}
        presence={flap.presence}
        tone={tone}
        fit={LINE_FIT}
        inverse={toOnTile}
        shade={<FlapShade shade={flap.landShade} fit={LINE_FIT} />}
        rotate={flap.land}
        opacity={flap.landOpacity}
      >
        {toGlyph}
      </FlapLeaf>
    </span>
  );
};

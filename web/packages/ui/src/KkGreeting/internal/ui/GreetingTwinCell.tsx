import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { FlapGlyph } from '../../../internal/flap/FlapGlyph';
import { FlapLeaf } from '../../../internal/flap/FlapLeaf';
import { FlapShade } from '../../../internal/flap/FlapShade';
import type { FlapTileTone } from '../../../internal/flap/FlapTile';
import { BOTTOM_HALF_CLIP, TOP_HALF_CLIP } from '../../../internal/flap/flap-pose';
import type { FlapTileFit } from '../../../internal/flap/flap-tile-bounds';
import type { TwinCell } from '../logic/greeting-twin';
import { useFlapCellMotion } from '../logic/use-flap-cell-motion';

const LINE_FIT: FlapTileFit = 'line';

interface GreetingTwinCellProps {
  cell: TwinCell;
  tone: FlapTileTone;
}

export const GreetingTwinCell: FC<GreetingTwinCellProps> = ({ cell, tone }) => {
  const flap = useFlapCellMotion(cell.track, cell.faces);
  const tileInk = tone === 'gold' ? 'onGold' : 'inverse';
  const box: CSSProperties = {
    position: 'absolute',
    left: cell.box.left,
    top: cell.box.top,
    width: cell.box.width,
    height: cell.box.height,
  };

  const fromGlyph = (
    <FlapGlyph variant="h1" tone={cell.glyph}>
      <motion.span>{flap.fromFace}</motion.span>
    </FlapGlyph>
  );
  const fromOnTile = (
    <FlapGlyph variant="h1" tone={tileInk}>
      <motion.span>{flap.fromFace}</motion.span>
    </FlapGlyph>
  );
  const toGlyph = (
    <FlapGlyph variant="h1" tone={cell.glyph}>
      <motion.span>{flap.toFace}</motion.span>
    </FlapGlyph>
  );
  const toOnTile = (
    <FlapGlyph variant="h1" tone={tileInk}>
      <motion.span>{flap.toFace}</motion.span>
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
      >
        {toGlyph}
      </FlapLeaf>
    </span>
  );
};

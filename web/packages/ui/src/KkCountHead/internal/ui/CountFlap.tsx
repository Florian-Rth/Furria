import type { MotionValue } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { FlapLeaf } from '../../../internal/flap/FlapLeaf';
import { FlapShade } from '../../../internal/flap/FlapShade';
import type { FlapTileTone } from '../../../internal/flap/FlapTile';
import { BOTTOM_HALF_CLIP, TOP_HALF_CLIP } from '../../../internal/flap/flap-pose';
import type { CountInk } from '../count-paint';
import type { CountRun } from '../logic/count-run';
import { useCountFlap } from '../logic/use-count-flap';
import { CountFace } from './CountFace';
import { CountGlyph } from './CountGlyph';

const LAYER: CSSProperties = { position: 'absolute', inset: 0 };
const PERSPECTIVE = 360;
const WHOLE = 1;

interface CountFlapProps {
  run: CountRun;
  clock: MotionValue<number>;
  tone: FlapTileTone;
  ink: CountInk;
}

export const CountFlap: FC<CountFlapProps> = ({ run, clock, tone, ink }) => {
  const { leaf, fromFace, toFace, fromLetter, toLetter, fromStar, toStar } = useCountFlap(
    run,
    clock,
  );
  const from = (
    <CountGlyph ink={ink}>
      <CountFace face={fromFace} letter={fromLetter} star={fromStar} />
    </CountGlyph>
  );
  const to = (
    <CountGlyph ink={ink}>
      <CountFace face={toFace} letter={toLetter} star={toStar} />
    </CountGlyph>
  );

  return (
    <span style={LAYER}>
      <FlapLeaf
        clip={leaf.revealClip}
        presence={WHOLE}
        tone={tone}
        inverse={to}
        perspective={PERSPECTIVE}
      />
      <FlapLeaf
        clip={leaf.coverClip}
        presence={WHOLE}
        tone={tone}
        inverse={from}
        perspective={PERSPECTIVE}
      />
      <FlapLeaf
        clip={TOP_HALF_CLIP}
        presence={WHOLE}
        tone={tone}
        inverse={from}
        shade={<FlapShade shade={leaf.fallShade} />}
        rotate={leaf.fall}
        opacity={leaf.fallOpacity}
        perspective={PERSPECTIVE}
      />
      <FlapLeaf
        clip={BOTTOM_HALF_CLIP}
        presence={WHOLE}
        tone={tone}
        inverse={to}
        shade={<FlapShade shade={leaf.landShade} />}
        rotate={leaf.land}
        opacity={leaf.landOpacity}
        perspective={PERSPECTIVE}
      />
    </span>
  );
};

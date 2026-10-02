import type { MotionValue } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { FlapGlyphTone } from '../../../internal/flap/FlapGlyph';
import { FlapGlyph } from '../../../internal/flap/FlapGlyph';
import { FlapLeaf } from '../../../internal/flap/FlapLeaf';
import { FlapShade } from '../../../internal/flap/FlapShade';
import { BOTTOM_HALF_CLIP, TOP_HALF_CLIP } from '../../../internal/flap/flap-pose';
import { useEyebrowFlapMotion } from '../logic/use-eyebrow-flap-motion';

const FLAP_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

interface KkDensePanelEyebrowFlapProps {
  from: string;
  to: string;
  tone: FlapGlyphTone;
  progress: MotionValue<number>;
}

export const KkDensePanelEyebrowFlap: FC<KkDensePanelEyebrowFlapProps> = ({
  from,
  to,
  tone,
  progress,
}) => {
  const flap = useEyebrowFlapMotion(progress);
  const fromInverse = (
    <FlapGlyph variant="caption" tone="inverse">
      {from}
    </FlapGlyph>
  );
  const toInverse = (
    <FlapGlyph variant="caption" tone="inverse">
      {to}
    </FlapGlyph>
  );

  return (
    <span aria-hidden style={FLAP_STYLE}>
      <FlapLeaf clip={flap.revealClip} presence={flap.presence} inverse={toInverse}>
        <FlapGlyph variant="caption" tone={tone}>
          {to}
        </FlapGlyph>
      </FlapLeaf>
      <FlapLeaf clip={flap.coverClip} presence={flap.presence} inverse={fromInverse}>
        <FlapGlyph variant="caption" tone={tone}>
          {from}
        </FlapGlyph>
      </FlapLeaf>
      <FlapLeaf
        clip={TOP_HALF_CLIP}
        presence={flap.presence}
        inverse={fromInverse}
        shade={<FlapShade shade={flap.fallShade} />}
        rotate={flap.fall}
        opacity={flap.fallOpacity}
      >
        <FlapGlyph variant="caption" tone={tone}>
          {from}
        </FlapGlyph>
      </FlapLeaf>
      <FlapLeaf
        clip={BOTTOM_HALF_CLIP}
        presence={flap.presence}
        inverse={toInverse}
        shade={<FlapShade shade={flap.landShade} />}
        rotate={flap.land}
        opacity={flap.landOpacity}
      >
        <FlapGlyph variant="caption" tone={tone}>
          {to}
        </FlapGlyph>
      </FlapLeaf>
    </span>
  );
};

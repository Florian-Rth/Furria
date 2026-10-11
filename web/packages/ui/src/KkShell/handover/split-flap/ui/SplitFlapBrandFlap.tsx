import type { MotionValue } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren } from 'react';
import { FlapLeaf } from '../../../../internal/flap/FlapLeaf';
import { FlapShade } from '../../../../internal/flap/FlapShade';
import { TOP_HALF_CLIP } from '../../../../internal/flap/flap-pose';
import { useFlapLeaf } from '../../../../internal/flap/use-flap-leaf';
import { BRAND_WINDOW } from '../logic/split-flap-flaps';
import { useSplitFlapClock } from '../logic/use-split-flap-clock';

const BRAND_PERSPECTIVE = 420;
const NO_TILE = 0;

const FLAP_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  display: 'grid',
  alignItems: 'center',
};

const SIZER_STYLE: CSSProperties = { gridArea: '1 / 1', visibility: 'hidden' };
const LEAVES_STYLE: CSSProperties = {
  gridArea: '1 / 1',
  position: 'relative',
  alignSelf: 'stretch',
};

interface SplitFlapBrandFlapProps extends PropsWithChildren {
  progress: MotionValue<number>;
}

export const SplitFlapBrandFlap: FC<SplitFlapBrandFlapProps> = ({ progress, children }) => {
  const flipped = useSplitFlapClock(progress, BRAND_WINDOW);
  const flap = useFlapLeaf(flipped);

  return (
    <span style={FLAP_STYLE}>
      <span style={SIZER_STYLE}>{children}</span>
      <span style={LEAVES_STYLE}>
        <FlapLeaf clip={flap.coverClip} presence={NO_TILE} perspective={BRAND_PERSPECTIVE}>
          {children}
        </FlapLeaf>
        <FlapLeaf
          clip={TOP_HALF_CLIP}
          presence={NO_TILE}
          rotate={flap.fall}
          opacity={flap.fallOpacity}
          shade={<FlapShade shade={flap.fallShade} />}
          perspective={BRAND_PERSPECTIVE}
        >
          {children}
        </FlapLeaf>
      </span>
    </span>
  );
};

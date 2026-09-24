import type { MotionValue } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren } from 'react';
import type { SplitFlapCell } from '../logic/split-flap-flaps';
import { BRAND_WINDOW } from '../logic/split-flap-flaps';
import { TOP_HALF_CLIP, useSplitFlapFlapMotion } from '../logic/use-split-flap-flap-motion';
import { SplitFlapLeaf } from './SplitFlapLeaf';
import { SplitFlapShade } from './SplitFlapShade';

const BRAND_PERSPECTIVE = 420;
const NO_TILE = 0;

const BRAND_CELL: SplitFlapCell = {
  slot: 'brand',
  from: '',
  to: '',
  fromCenter: 0,
  toCenter: 0,
  width: 0,
};

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
  const flap = useSplitFlapFlapMotion(progress, BRAND_WINDOW, BRAND_CELL);

  return (
    <span style={FLAP_STYLE}>
      <span style={SIZER_STYLE}>{children}</span>
      <span style={LEAVES_STYLE}>
        <SplitFlapLeaf clip={flap.coverClip} presence={NO_TILE} perspective={BRAND_PERSPECTIVE}>
          {children}
        </SplitFlapLeaf>
        <SplitFlapLeaf
          clip={TOP_HALF_CLIP}
          presence={NO_TILE}
          rotate={flap.fall}
          opacity={flap.fallOpacity}
          shade={<SplitFlapShade shade={flap.fallShade} />}
          perspective={BRAND_PERSPECTIVE}
        >
          {children}
        </SplitFlapLeaf>
      </span>
    </span>
  );
};

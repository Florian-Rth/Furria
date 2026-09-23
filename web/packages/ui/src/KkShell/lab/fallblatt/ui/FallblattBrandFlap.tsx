import type { MotionValue } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren } from 'react';
import type { FallblattCell } from '../logic/fallblatt-flaps';
import { BRAND_WINDOW } from '../logic/fallblatt-flaps';
import { TOP_HALF_CLIP, useFallblattFlapMotion } from '../logic/use-fallblatt-flap-motion';
import { FallblattLeaf } from './FallblattLeaf';
import { FallblattShade } from './FallblattShade';

const BRAND_PERSPECTIVE = 420;
const NO_TILE = 0;

const BRAND_CELL: FallblattCell = {
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

interface FallblattBrandFlapProps extends PropsWithChildren {
  progress: MotionValue<number>;
}

export const FallblattBrandFlap: FC<FallblattBrandFlapProps> = ({ progress, children }) => {
  const flap = useFallblattFlapMotion(progress, BRAND_WINDOW, BRAND_CELL);

  return (
    <span style={FLAP_STYLE}>
      <span style={SIZER_STYLE}>{children}</span>
      <span style={LEAVES_STYLE}>
        <FallblattLeaf clip={flap.coverClip} presence={NO_TILE} perspective={BRAND_PERSPECTIVE}>
          {children}
        </FallblattLeaf>
        <FallblattLeaf
          clip={TOP_HALF_CLIP}
          presence={NO_TILE}
          rotate={flap.fall}
          opacity={flap.fallOpacity}
          shade={<FallblattShade shade={flap.fallShade} />}
          perspective={BRAND_PERSPECTIVE}
        >
          {children}
        </FallblattLeaf>
      </span>
    </span>
  );
};

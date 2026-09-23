import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren, ReactNode } from 'react';
import { FallblattTile } from './FallblattTile';

const PERSPECTIVE = 220;

const LEAF_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
};

const INVERSE_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

interface FallblattLeafProps extends PropsWithChildren {
  clip: MotionValue<string> | string;
  presence: MotionValue<number> | number;
  inverse?: ReactNode;
  shade?: ReactNode;
  rotate?: MotionValue<number>;
  opacity?: MotionValue<number>;
  perspective?: number;
}

export const FallblattLeaf: FC<FallblattLeafProps> = ({
  clip,
  presence,
  inverse,
  shade,
  rotate,
  opacity,
  perspective = PERSPECTIVE,
  children,
}) => (
  <motion.span
    style={{
      ...LEAF_STYLE,
      clipPath: clip,
      rotateX: rotate,
      opacity,
      transformPerspective: perspective,
    }}
  >
    <FallblattTile presence={presence} />
    {children}
    <motion.span style={{ ...INVERSE_STYLE, opacity: presence }}>{inverse}</motion.span>
    {shade}
  </motion.span>
);

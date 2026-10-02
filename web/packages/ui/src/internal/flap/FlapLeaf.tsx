import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren, ReactNode } from 'react';
import type { FlapTileTone } from './FlapTile';
import { FlapTile } from './FlapTile';

const PERSPECTIVE = 220;

const LEAF_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
};

const INVERSE_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

interface FlapLeafProps extends PropsWithChildren {
  clip: MotionValue<string> | string;
  presence: MotionValue<number> | number;
  tone?: FlapTileTone;
  inverse?: ReactNode;
  shade?: ReactNode;
  rotate?: MotionValue<number>;
  opacity?: MotionValue<number>;
  perspective?: number;
}

export const FlapLeaf: FC<FlapLeafProps> = ({
  clip,
  presence,
  tone = 'ink',
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
    <FlapTile presence={presence} tone={tone} />
    {children}
    <motion.span style={{ ...INVERSE_STYLE, opacity: presence }}>{inverse}</motion.span>
    {shade}
  </motion.span>
);

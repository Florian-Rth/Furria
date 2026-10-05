import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren, ReactNode } from 'react';
import type { FlapTileTone } from './FlapTile';
import { FlapTile } from './FlapTile';
import type { FlapTileFit } from './flap-tile-bounds';
import { useTileBand } from './use-tile-band';

const PERSPECTIVE = 220;

const LEAF_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
};

const BAND_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

interface FlapLeafProps extends PropsWithChildren {
  clip: MotionValue<string> | string;
  presence: MotionValue<number> | number;
  tone?: FlapTileTone;
  fit?: FlapTileFit;
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
  fit = 'bleed',
  inverse,
  shade,
  rotate,
  opacity,
  perspective = PERSPECTIVE,
  children,
}) => {
  const band = useTileBand(presence);

  return (
    <motion.span
      style={{
        ...LEAF_STYLE,
        clipPath: clip,
        rotateX: rotate,
        opacity,
        transformPerspective: perspective,
      }}
    >
      {children}
      <motion.span style={{ ...BAND_STYLE, clipPath: band }}>
        <FlapTile tone={tone} fit={fit} />
        {inverse}
      </motion.span>
      {shade}
    </motion.span>
  );
};

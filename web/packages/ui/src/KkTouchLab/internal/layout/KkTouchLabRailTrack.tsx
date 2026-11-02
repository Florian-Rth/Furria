import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';

interface KkTouchLabRailTrackProps extends PropsWithChildren {
  x: MotionValue<number>;
}

export const KkTouchLabRailTrack: FC<KkTouchLabRailTrackProps> = ({ x, children }) => (
  <motion.div style={{ x, position: 'absolute', left: 0, top: 0, bottom: 0, width: 0 }}>
    {children}
  </motion.div>
);

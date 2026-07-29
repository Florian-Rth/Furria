import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import type {
  PhotoStackEntrance,
  PhotoStackFrameSpec,
} from '@/features/gallery/photo-stack-frames';

interface PhotoStackFrameProps extends PropsWithChildren {
  spec: PhotoStackFrameSpec;
  entrance: PhotoStackEntrance;
}

export const PhotoStackFrame: FC<PhotoStackFrameProps> = ({ spec, entrance, children }) => (
  <motion.div
    initial={entrance.initial}
    animate={entrance.animate}
    transition={entrance.transition}
    style={{
      position: 'absolute',
      top: 0,
      left: `${spec.leftPercent}%`,
      marginTop: `${spec.topPercent}%`,
      width: `${spec.widthPercent}%`,
      zIndex: spec.depth,
    }}
  >
    {children}
  </motion.div>
);

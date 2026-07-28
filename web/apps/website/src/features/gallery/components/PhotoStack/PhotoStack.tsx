import Box from '@mui/material/Box';
import { useReducedMotion } from 'motion/react';
import type { FC } from 'react';
import {
  fannedPhotoStackFrames,
  leadPhotoStackFrame,
  resolvePhotoStackEntrance,
} from '@/features/gallery/photo-stack-frames';
import { PhotoStackFan } from './internal/layout/PhotoStackFan';
import { PhotoStackFrame } from './internal/layout/PhotoStackFrame';
import { PhotoStackPhoto } from './internal/ui/PhotoStackPhoto';

export const PhotoStack: FC = () => {
  const reducedMotion = useReducedMotion();

  return (
    <Box
      aria-hidden
      data-kk-photo-stack
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: { xs: '17rem', desktop: 'none' },
        aspectRatio: '1 / 1',
        opacity: { xs: 0.2, desktop: 1 },
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <PhotoStackFrame
        spec={leadPhotoStackFrame}
        entrance={resolvePhotoStackEntrance(leadPhotoStackFrame, reducedMotion)}
      >
        <PhotoStackPhoto
          label={leadPhotoStackFrame.label}
          orientation={leadPhotoStackFrame.orientation}
        />
      </PhotoStackFrame>
      <PhotoStackFan>
        {fannedPhotoStackFrames.map((spec) => (
          <PhotoStackFrame
            key={spec.label}
            spec={spec}
            entrance={resolvePhotoStackEntrance(spec, reducedMotion)}
          >
            <PhotoStackPhoto label={spec.label} orientation={spec.orientation} />
          </PhotoStackFrame>
        ))}
      </PhotoStackFan>
    </Box>
  );
};

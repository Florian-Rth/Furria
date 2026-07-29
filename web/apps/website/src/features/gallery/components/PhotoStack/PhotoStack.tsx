import Box from '@mui/material/Box';
import { useReducedMotion } from 'motion/react';
import type { FC } from 'react';
import {
  leadPhotoStackFrame,
  photoStackAspectRatio,
  resolveFannedPhotoStackFrames,
  resolvePhotoStackEntrance,
} from '@/features/gallery/photo-stack-frames';
import { PhotoStackFan } from './internal/layout/PhotoStackFan';
import { PhotoStackFrame } from './internal/layout/PhotoStackFrame';
import { PhotoStackPhoto } from './internal/ui/PhotoStackPhoto';

export const PhotoStack: FC = () => {
  const reducedMotion = useReducedMotion();
  const leadEntrance = resolvePhotoStackEntrance(leadPhotoStackFrame, reducedMotion);
  const fannedFrames = resolveFannedPhotoStackFrames(reducedMotion);

  return (
    <Box
      aria-hidden
      data-kk-photo-stack
      sx={{
        position: 'relative',
        display: { xs: 'none', desktop: 'block' },
        aspectRatio: photoStackAspectRatio,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <PhotoStackFrame spec={leadPhotoStackFrame} entrance={leadEntrance}>
        <PhotoStackPhoto
          label={leadPhotoStackFrame.label}
          orientation={leadPhotoStackFrame.orientation}
        />
      </PhotoStackFrame>
      <PhotoStackFan>
        {fannedFrames.map(({ spec, entrance }) => (
          <PhotoStackFrame key={spec.label} spec={spec} entrance={entrance}>
            <PhotoStackPhoto label={spec.label} orientation={spec.orientation} />
          </PhotoStackFrame>
        ))}
      </PhotoStackFan>
    </Box>
  );
};

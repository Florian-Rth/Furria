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
        <PhotoStackPhoto position={leadPhotoStackFrame.position} />
      </PhotoStackFrame>
      <PhotoStackFan>
        {fannedFrames.map(({ spec, entrance }) => (
          <PhotoStackFrame key={spec.position} spec={spec} entrance={entrance}>
            <PhotoStackPhoto position={spec.position} />
          </PhotoStackFrame>
        ))}
      </PhotoStackFan>
    </Box>
  );
};

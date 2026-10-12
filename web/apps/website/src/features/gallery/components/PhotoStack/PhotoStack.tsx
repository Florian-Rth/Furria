import Box from '@mui/material/Box';
import { useReducedMotion } from 'motion/react';
import type { FC } from 'react';
import {
  photoStackAspectRatio,
  resolveShownPhotoStackFrames,
} from '@/features/gallery/photo-stack-frames';
import { useFramedSlotPositions } from '@/lib/website-pictures/use-slot-positions';
import { PhotoStackFan } from './internal/layout/PhotoStackFan';
import { PhotoStackFrame } from './internal/layout/PhotoStackFrame';
import { PhotoStackPhoto } from './internal/ui/PhotoStackPhoto';

export const PhotoStack: FC = () => {
  const reducedMotion = useReducedMotion();
  const positions = useFramedSlotPositions('gallery.stack');
  const { lead, fanned } = resolveShownPhotoStackFrames(positions, reducedMotion);

  const leadFrame =
    lead === null ? null : (
      <PhotoStackFrame spec={lead.spec} entrance={lead.entrance}>
        <PhotoStackPhoto position={lead.spec.position} />
      </PhotoStackFrame>
    );

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
      {leadFrame}
      <PhotoStackFan>
        {fanned.map(({ spec, entrance }) => (
          <PhotoStackFrame key={spec.position} spec={spec} entrance={entrance}>
            <PhotoStackPhoto position={spec.position} />
          </PhotoStackFrame>
        ))}
      </PhotoStackFan>
    </Box>
  );
};

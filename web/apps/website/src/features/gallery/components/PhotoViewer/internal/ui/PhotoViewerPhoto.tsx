import { KkPhoto, kkTokens } from '@furria/ui';
import type { PanInfo, Transition } from 'motion/react';
import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { Photo } from '@/features/gallery/gallery-content';
import type { PhotoStepDirection } from '@/features/gallery/photo-viewer-steps';
import { resolveSwipeStep } from '@/features/gallery/photo-viewer-steps';

const FADE_TRANSITION: Transition = { duration: 0.22, ease: 'easeOut' };
const NO_TRANSITION: Transition = { duration: 0 };

const AREA_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  minWidth: 0,
  display: 'grid',
  placeItems: 'center',
  touchAction: 'pan-y',
};

interface PhotoViewerPhotoProps {
  photo: Photo;
  placeholderLabel: string;
  onStep: (direction: PhotoStepDirection) => void;
}

export const PhotoViewerPhoto: FC<PhotoViewerPhotoProps> = ({
  photo,
  placeholderLabel,
  onStep,
}) => {
  const reducedMotion = useReducedMotion();

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    const direction = resolveSwipeStep(info.offset.x);
    if (direction !== null) {
      onStep(direction);
    }
  };

  return (
    <motion.div
      key={placeholderLabel}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={reducedMotion === true ? 0 : 0.16}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={reducedMotion === true ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion === true ? NO_TRANSITION : FADE_TRANSITION}
      style={AREA_STYLE}
    >
      <KkPhoto
        alt={photo.alt}
        orientation={photo.orientation}
        placeholderLabel={placeholderLabel}
        source={photo.source}
        sx={{
          width: { xs: '100%', desktop: 'auto' },
          height: { xs: 'auto', desktop: '100%' },
          maxWidth: '100%',
          maxHeight: '100%',
          boxShadow: kkTokens.shadow.raised,
        }}
      />
    </motion.div>
  );
};

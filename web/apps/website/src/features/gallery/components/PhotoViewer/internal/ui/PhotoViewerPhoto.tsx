import { KkPhoto, kkTokens } from '@furria/ui';
import type { PanInfo, TargetAndTransition, Transition } from 'motion/react';
import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { Photo } from '@/features/gallery/gallery-content';
import type { PhotoStepDirection } from '@/features/gallery/photo-viewer-steps';
import { resolveSwipeStep } from '@/features/gallery/photo-viewer-steps';

const FADE_TRANSITION: Transition = { duration: 0.22, ease: 'easeOut' };
const NO_TRANSITION: Transition = { duration: 0 };

const DRAG_CONSTRAINTS = { left: 0, right: 0 };
const SETTLED_OPACITY: TargetAndTransition = { opacity: 1 };

interface PhotoSwipeMotion {
  initial: false | TargetAndTransition;
  transition: Transition;
  dragElastic: number;
}

const resolvePhotoSwipeMotion = (reducedMotion: boolean | null): PhotoSwipeMotion =>
  reducedMotion === true
    ? { initial: false, transition: NO_TRANSITION, dragElastic: 0 }
    : { initial: { opacity: 0 }, transition: FADE_TRANSITION, dragElastic: 0.16 };

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
  const swipeMotion = resolvePhotoSwipeMotion(reducedMotion);

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
      dragConstraints={DRAG_CONSTRAINTS}
      dragElastic={swipeMotion.dragElastic}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={swipeMotion.initial}
      animate={SETTLED_OPACITY}
      transition={swipeMotion.transition}
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

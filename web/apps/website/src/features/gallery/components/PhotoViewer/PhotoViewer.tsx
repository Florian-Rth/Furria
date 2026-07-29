import type { FC, KeyboardEvent } from 'react';
import type { Album } from '@/features/gallery/gallery-content';
import { resolvePhotoViewerFrame } from '@/features/gallery/photo-viewer-frame';
import type { PhotoStepDirection } from '@/features/gallery/photo-viewer-steps';
import { resolveArrowStep } from '@/features/gallery/photo-viewer-steps';
import { PhotoViewerFooter } from './internal/layout/PhotoViewerFooter';
import { PhotoViewerHeader } from './internal/layout/PhotoViewerHeader';
import { PhotoViewerHeaderActions } from './internal/layout/PhotoViewerHeaderActions';
import { PhotoViewerStage } from './internal/layout/PhotoViewerStage';
import { PhotoViewerSurface } from './internal/layout/PhotoViewerSurface';
import { useShownPhotoIndex } from './internal/logic/use-shown-photo-index';
import { PhotoViewerAlbumTitle } from './internal/ui/PhotoViewerAlbumTitle';
import { PhotoViewerCaption } from './internal/ui/PhotoViewerCaption';
import { PhotoViewerCloseButton } from './internal/ui/PhotoViewerCloseButton';
import { PhotoViewerCounter } from './internal/ui/PhotoViewerCounter';
import { PhotoViewerDialog } from './internal/ui/PhotoViewerDialog';
import { PhotoViewerMeta } from './internal/ui/PhotoViewerMeta';
import { PhotoViewerPhoto } from './internal/ui/PhotoViewerPhoto';
import { PhotoViewerStepButton } from './internal/ui/PhotoViewerStepButton';

const PHOTO_VIEWER_TITLE_ID = 'photo-viewer-title';

interface PhotoViewerProps {
  album: Album;
  index: number | null;
  onStep: (direction: PhotoStepDirection) => void;
  onClose: () => void;
}

export const PhotoViewer: FC<PhotoViewerProps> = ({ album, index, onStep, onClose }) => {
  const shownIndex = useShownPhotoIndex(index);
  const frame = resolvePhotoViewerFrame(album, shownIndex);

  if (frame === null) {
    return null;
  }

  const open = index !== null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const direction = resolveArrowStep(event.key);
    if (direction === null) {
      return;
    }
    event.preventDefault();
    onStep(direction);
  };

  return (
    <PhotoViewerDialog
      open={open}
      titleId={PHOTO_VIEWER_TITLE_ID}
      onClose={onClose}
      onKeyDown={handleKeyDown}
    >
      <PhotoViewerSurface>
        <PhotoViewerHeader>
          <PhotoViewerAlbumTitle album={album} titleId={PHOTO_VIEWER_TITLE_ID} />
          <PhotoViewerHeaderActions>
            <PhotoViewerCounter position={frame.position} countSuffix={frame.countSuffix} />
            <PhotoViewerCloseButton onClose={onClose} />
          </PhotoViewerHeaderActions>
        </PhotoViewerHeader>
        <PhotoViewerStage>
          <PhotoViewerPhoto
            photo={frame.photo}
            placeholderLabel={frame.placeholderLabel}
            onStep={onStep}
          />
        </PhotoViewerStage>
        <PhotoViewerFooter>
          <PhotoViewerCaption photo={frame.photo} />
          <PhotoViewerMeta album={album} />
        </PhotoViewerFooter>
        <PhotoViewerStepButton
          direction={-1}
          disabled={frame.previousDisabled}
          onStep={onStep}
          sx={{ gridArea: 'prev', alignSelf: 'center', justifySelf: 'center' }}
        />
        <PhotoViewerStepButton
          direction={1}
          disabled={frame.nextDisabled}
          onStep={onStep}
          sx={{ gridArea: 'next', alignSelf: 'center', justifySelf: 'center' }}
        />
      </PhotoViewerSurface>
    </PhotoViewerDialog>
  );
};

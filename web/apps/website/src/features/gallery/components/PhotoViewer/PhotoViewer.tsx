import type { FC, KeyboardEvent } from 'react';
import type { Album } from '@/features/gallery/gallery-content';
import { buildPhotoPlaceholderLabel } from '@/features/gallery/gallery-content';
import type { PhotoStepDirection } from '@/features/gallery/photo-viewer-steps';
import { canStepPhoto, resolveArrowStep } from '@/features/gallery/photo-viewer-steps';
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
  const shownPhoto = shownIndex === null ? undefined : album.photos[shownIndex];

  if (shownIndex === null || shownPhoto === undefined) {
    return null;
  }

  const photoCount = album.photos.length;

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
      open={index !== null}
      titleId={PHOTO_VIEWER_TITLE_ID}
      onClose={onClose}
      onKeyDown={handleKeyDown}
    >
      <PhotoViewerSurface>
        <PhotoViewerHeader>
          <PhotoViewerAlbumTitle album={album} titleId={PHOTO_VIEWER_TITLE_ID} />
          <PhotoViewerHeaderActions>
            <PhotoViewerCounter position={shownIndex + 1} photoCount={photoCount} />
            <PhotoViewerCloseButton onClose={onClose} />
          </PhotoViewerHeaderActions>
        </PhotoViewerHeader>
        <PhotoViewerStage>
          <PhotoViewerPhoto
            photo={shownPhoto}
            placeholderLabel={buildPhotoPlaceholderLabel(album, shownIndex)}
            onStep={onStep}
          />
        </PhotoViewerStage>
        <PhotoViewerFooter>
          <PhotoViewerCaption photo={shownPhoto} />
          <PhotoViewerMeta album={album} />
        </PhotoViewerFooter>
        <PhotoViewerStepButton
          direction={-1}
          disabled={!canStepPhoto(shownIndex, -1, photoCount)}
          onStep={onStep}
          sx={{ gridArea: 'prev', alignSelf: 'center', justifySelf: 'center' }}
        />
        <PhotoViewerStepButton
          direction={1}
          disabled={!canStepPhoto(shownIndex, 1, photoCount)}
          onStep={onStep}
          sx={{ gridArea: 'next', alignSelf: 'center', justifySelf: 'center' }}
        />
      </PhotoViewerSurface>
    </PhotoViewerDialog>
  );
};

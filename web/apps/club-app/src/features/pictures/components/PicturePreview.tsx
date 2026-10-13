import type { KkGroupTone } from '@furria/ui';
import { aspectRatioCss, KkPhoto, KkPhotoPlaceholder, toImageSource } from '@furria/ui';
import type { FC } from 'react';
import type { Picture } from '@/lib/api/schemas';
import type { PictureKind } from '../picture-target';
import { PICTURE_ASPECTS } from '../picture-target';

const PREVIEW_SIZES = '(min-width: 900px) 32rem, 100vw';

interface PicturePreviewProps {
  kind: PictureKind;
  alt: string;
  placeholderLabel: string;
  picture: Picture | null;
  tone: KkGroupTone | undefined;
}

export const PicturePreview: FC<PicturePreviewProps> = ({
  kind,
  alt,
  placeholderLabel,
  picture,
  tone,
}) => {
  const aspect = PICTURE_ASPECTS[kind];
  const aspectRatio = aspectRatioCss(aspect);
  const image = toImageSource(picture, aspect, PREVIEW_SIZES);

  if (image === null) {
    return <KkPhotoPlaceholder label={placeholderLabel} tone={tone} aspectRatio={aspectRatio} />;
  }

  return (
    <KkPhoto
      alt={alt}
      orientation="portrait"
      aspectRatio={aspectRatio}
      placeholderLabel={placeholderLabel}
      image={image}
    />
  );
};

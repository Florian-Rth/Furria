import type { KkGroupTone } from '@furria/ui';
import { KkPhoto, KkPhotoPlaceholder } from '@furria/ui';
import type { FC } from 'react';

const PREVIEW_SIZES = '(min-width: 900px) 32rem, 100vw';

interface PicturePreviewProps {
  aspectRatio: string;
  alt: string;
  placeholderLabel: string;
  source: string | undefined;
  sourceSet: string | undefined;
  tone: KkGroupTone | undefined;
}

export const PicturePreview: FC<PicturePreviewProps> = ({
  aspectRatio,
  alt,
  placeholderLabel,
  source,
  sourceSet,
  tone,
}) => {
  if (source === undefined) {
    return <KkPhotoPlaceholder label={placeholderLabel} tone={tone} aspectRatio={aspectRatio} />;
  }

  return (
    <KkPhoto
      alt={alt}
      orientation="portrait"
      aspectRatio={aspectRatio}
      placeholderLabel={placeholderLabel}
      source={source}
      sourceSet={sourceSet}
      sizes={PREVIEW_SIZES}
    />
  );
};

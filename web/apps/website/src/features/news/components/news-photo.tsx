import type { Picture } from '@furria/api-client';
import { toImageSource } from '@furria/ui/image-source';
import { KkPhoto } from '@furria/ui/KkPhoto';
import type { ReactNode } from 'react';

export const newsPhotoOf = (picture: Picture | null, sizes: string): ReactNode => {
  const image = toImageSource(picture, 'banner', sizes);

  return image === null ? null : <KkPhoto alt="" image={image} fill />;
};

import type { Picture } from '@furria/api-client';
import { KkPhoto, toImageSource } from '@furria/ui';
import type { ReactNode } from 'react';

export const newsPhotoOf = (picture: Picture | null, sizes: string): ReactNode => {
  const image = toImageSource(picture, 'banner', sizes);

  return image === null ? null : <KkPhoto alt="" image={image} fill />;
};

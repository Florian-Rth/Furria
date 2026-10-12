import type { Picture } from '@furria/api-client';
import { KkCoverPicture, toImageSource } from '@furria/ui';
import type { ReactNode } from 'react';

const PICTURE_FIT = { borderRadius: 'inherit' };

export const newsPhotoOf = (picture: Picture | null, sizes: string): ReactNode => {
  const image = toImageSource(picture, 'banner', sizes);

  return image === null ? null : <KkCoverPicture image={image} alt="" sx={PICTURE_FIT} />;
};

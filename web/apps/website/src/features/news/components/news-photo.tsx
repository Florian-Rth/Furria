import type { Picture } from '@furria/api-client';
import { KkCoverPicture, toPictureSourceSet } from '@furria/ui';
import type { ReactNode } from 'react';

const BANNER_ASPECT = 2;
const PICTURE_FIT = { borderRadius: 'inherit' };

export const newsPhotoOf = (picture: Picture | null, sizes: string): ReactNode =>
  picture === null ? null : (
    <KkCoverPicture
      source={picture.mediumUrl}
      sourceSet={toPictureSourceSet(picture, BANNER_ASPECT)}
      sizes={sizes}
      alt=""
      sx={PICTURE_FIT}
    />
  );

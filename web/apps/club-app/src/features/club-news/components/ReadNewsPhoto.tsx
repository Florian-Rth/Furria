import type { KkPictureUrls } from '@furria/ui/image-source';
import { toImageSource } from '@furria/ui/image-source';
import { KkPhoto } from '@furria/ui/KkPhoto';
import type { FC } from 'react';

interface ReadNewsPhotoProps {
  picture: KkPictureUrls | null;
  sizes: string;
}

export const ReadNewsPhoto: FC<ReadNewsPhotoProps> = ({ picture, sizes }) => {
  const image = toImageSource(picture, 'banner', sizes);

  return <KkPhoto alt="" image={image} fill />;
};

import type { FC } from 'react';
import type { KkImageSource } from '../../../image-source';
import { KkPhoto } from '../../../KkPhoto';
import { fadedColor } from '../orbit-scene-motion';

const CENTRE_WIDTH = 27;

interface KkOrbitSceneCentreProps {
  image: KkImageSource;
  aspectRatio: string;
}

export const KkOrbitSceneCentre: FC<KkOrbitSceneCentreProps> = ({ image, aspectRatio }) => (
  <KkPhoto
    alt=""
    image={image}
    aspectRatio={aspectRatio}
    fit="contain"
    sx={(theme) => ({
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: `${CENTRE_WIDTH}%`,
      borderRadius: 0,
      overflow: 'visible',
      transform: 'translate(-50%, -50%)',
      filter: `drop-shadow(0 0 10px ${fadedColor((theme.vars ?? theme).palette.common.black, 0.25)})`,
      ...theme.applyStyles('dark', {
        filter: `drop-shadow(0 0 12px ${fadedColor((theme.vars ?? theme).palette.common.black, 0.6)})`,
      }),
    })}
  />
);

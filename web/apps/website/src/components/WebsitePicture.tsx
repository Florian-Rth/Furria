import { aspectRatioCss } from '@furria/ui/image-aspect';
import { KkPhoto } from '@furria/ui/KkPhoto';
import { kkTokens } from '@furria/ui/tokens';
import type { PictureSlotKey } from '@furria/website-pictures';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { useWebsitePicture } from '@/lib/website-pictures/use-website-picture';

const FIRST_POSITION = 1;
const FILL_SIZING = { width: '100%', height: '100%' } as const;

interface WebsitePictureProps {
  slot: PictureSlotKey;
  sizes: string;
  position?: number;
  priority?: boolean;
  fill?: boolean;
}

export const WebsitePicture: FC<WebsitePictureProps> = ({
  slot,
  sizes,
  position = FIRST_POSITION,
  priority = false,
  fill = false,
}) => {
  const picture = useWebsitePicture(slot, sizes, position);

  if (picture.state === 'undeclared') {
    return null;
  }

  const aspectRatio = fill ? undefined : aspectRatioCss(picture.aspect);
  const sizing = fill
    ? FILL_SIZING
    : { width: '100%', aspectRatio, borderRadius: `${kkTokens.radius.base}px` };

  if (picture.state === 'pending') {
    return <Box data-kk-website-picture="pending" sx={sizing} />;
  }

  if (picture.state === 'empty') {
    return <KkPhoto alt="" aspectRatio={aspectRatio} fill={fill} />;
  }

  return (
    <KkPhoto
      alt={picture.alt}
      image={picture.image}
      aspectRatio={aspectRatio}
      fill={fill}
      priority={priority}
    />
  );
};

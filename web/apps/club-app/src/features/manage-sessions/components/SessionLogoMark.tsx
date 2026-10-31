import type { KkImageSource } from '@furria/ui/image-source';
import { KkPhoto } from '@furria/ui/KkPhoto';
import type { FC } from 'react';

interface SessionLogoMarkProps {
  image: KkImageSource;
  label: string;
  size: number;
}

export const SessionLogoMark: FC<SessionLogoMarkProps> = ({ image, label, size }) => (
  <KkPhoto
    alt={label}
    image={image}
    fit="contain"
    fill
    sx={{ width: size, height: size, flexShrink: 0 }}
  />
);

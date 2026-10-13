import { KkPhoto, logoSourceOf } from '@furria/ui';
import type { FC } from 'react';

interface SessionLogoMarkProps {
  logoSvg: string | null;
  label: string;
  size: number;
}

export const SessionLogoMark: FC<SessionLogoMarkProps> = ({ logoSvg, label, size }) => {
  const source = logoSourceOf(logoSvg);

  if (source === null) {
    return null;
  }

  const image = { src: source };

  return (
    <KkPhoto
      alt={label}
      image={image}
      fit="contain"
      fill
      sx={{ width: size, height: size, flexShrink: 0 }}
    />
  );
};

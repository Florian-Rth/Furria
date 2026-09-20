import { logoSourceOf } from '@furria/ui';
import Box from '@mui/material/Box';
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

  return (
    <Box
      component="img"
      src={source}
      alt={label}
      sx={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
    />
  );
};

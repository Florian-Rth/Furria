import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

const CANVAS = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  display: 'block',
  overflow: 'visible',
  pointerEvents: 'none',
} as const;

const SILENT = { 'aria-hidden': true } as const;

interface KkAvatarCanvasProps extends PropsWithChildren {
  box: number;
  label: string | null;
}

export const KkAvatarCanvas: FC<KkAvatarCanvasProps> = ({ box, label, children }) => {
  const viewBox = `0 0 ${box} ${box}`;
  const naming = label === null || label === '' ? SILENT : { role: 'img', 'aria-label': label };

  return (
    <Box component="svg" viewBox={viewBox} data-kk-avatar-canvas {...naming} sx={CANVAS}>
      {children}
    </Box>
  );
};

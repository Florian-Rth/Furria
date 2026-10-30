import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { useStudioHDrag } from '../../../KkStudioHDrag/use-studio-h-drag';

interface KkStudioHWaveRootProps extends PropsWithChildren {
  label: string;
  onScrub: (share: number) => void;
}

export const KkStudioHWaveRoot: FC<KkStudioHWaveRootProps> = ({ label, onScrub, children }) => {
  const drag = useStudioHDrag({
    onPress: (share) => {
      onScrub(share.x);
    },
    onMove: (share) => {
      onScrub(share.x);
    },
  });

  return (
    <Box
      role="group"
      aria-label={label}
      data-kk-studio-h-wave
      data-kk-studio-h-track
      {...drag}
      sx={{
        position: 'absolute',
        inset: 0,
        mx: { xs: 1.5, desktop: 2.5 },
        my: { xs: 1.5, desktop: 2 },
        touchAction: 'none',
        cursor: 'text',
      }}
    >
      {children}
    </Box>
  );
};

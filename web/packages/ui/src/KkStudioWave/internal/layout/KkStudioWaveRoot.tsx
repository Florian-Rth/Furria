import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';

interface KkStudioWaveRootProps extends PropsWithChildren {
  label: string;
  onScrub: (share: number) => void;
}

export const KkStudioWaveRoot: FC<KkStudioWaveRootProps> = ({ label, onScrub, children }) => {
  const drag = useStudioDrag({
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
      data-kk-studio-wave
      data-kk-studio-track
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

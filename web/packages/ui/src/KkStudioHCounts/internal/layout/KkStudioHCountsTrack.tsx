import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkStudioHShare } from '../../../KkStudioHDrag/use-studio-h-drag';
import { useStudioHDrag } from '../../../KkStudioHDrag/use-studio-h-drag';

interface KkStudioHCountsTrackProps extends PropsWithChildren {
  onPress: (share: KkStudioHShare) => void;
  onMove: (share: KkStudioHShare) => void;
  onEnd: () => void;
}

export const KkStudioHCountsTrack: FC<KkStudioHCountsTrackProps> = ({
  onPress,
  onMove,
  onEnd,
  children,
}) => {
  const drag = useStudioHDrag({ onPress, onMove, onEnd });

  return (
    <Stack
      direction="row"
      data-kk-studio-h-track
      {...drag}
      sx={{
        position: 'relative',
        width: '100%',
        height: '2.25rem',
        gap: 0.5,
        touchAction: 'none',
        cursor: 'col-resize',
      }}
    >
      {children}
    </Stack>
  );
};

import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';

interface KkStudioCountsTrackProps extends PropsWithChildren {
  onPress: (share: KkStudioShare) => void;
  onMove: (share: KkStudioShare) => void;
  onEnd: (moved: boolean) => void;
}

export const KkStudioCountsTrack: FC<KkStudioCountsTrackProps> = ({
  onPress,
  onMove,
  onEnd,
  children,
}) => {
  const drag = useStudioDrag({ onPress, onMove, onEnd });

  return (
    <Stack
      direction="row"
      data-kk-studio-track
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

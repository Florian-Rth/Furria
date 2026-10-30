import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';

interface KkLaneTrackScrubProps {
  label: string;
  onSeek: (share: number) => void;
}

export const KkLaneTrackScrub: FC<KkLaneTrackScrubProps> = ({ label, onSeek }) => {
  const seek = (point: KkStudioShare): void => {
    onSeek(point.x);
  };
  const drag = useStudioDrag({ onPress: seek, onMove: seek });

  return (
    <Box
      aria-label={label}
      title={label}
      data-kk-lane-scrub
      {...drag}
      sx={{ position: 'absolute', inset: 0, cursor: 'col-resize', touchAction: 'none' }}
    />
  );
};

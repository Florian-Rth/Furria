import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';

interface KkFocusLanesSeekProps {
  onSeek: (share: number) => void;
}

export const KkFocusLanesSeek: FC<KkFocusLanesSeekProps> = ({ onSeek }) => {
  const seek = (share: KkStudioShare): void => {
    onSeek(share.x);
  };
  const drag = useStudioDrag({ onPress: seek, onMove: seek });

  return (
    <Box
      aria-hidden
      {...drag}
      sx={{ position: 'absolute', inset: 0, cursor: 'text', touchAction: 'none' }}
    />
  );
};

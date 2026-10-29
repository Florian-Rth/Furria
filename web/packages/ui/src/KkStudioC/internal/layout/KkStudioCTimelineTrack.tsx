import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { shiftStyleOf } from '../sticky-label';

interface KkStudioCTimelineTrackProps extends PropsWithChildren {
  width: number;
  shift: number;
}

export const KkStudioCTimelineTrack: FC<KkStudioCTimelineTrackProps> = ({
  width,
  shift,
  children,
}) => {
  const place = shiftStyleOf(width, shift);

  return (
    <Stack
      data-kk-studio-c-track
      style={place}
      sx={{ position: 'relative', willChange: 'transform' }}
    >
      {children}
    </Stack>
  );
};

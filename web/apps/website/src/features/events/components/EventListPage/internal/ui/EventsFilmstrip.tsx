import { KkPhotoPlaceholder, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const FRAME_TILTS = [-2, 1.5, -1, 2, -1.5, 1, -2.5, 2] as const;

const FILMSTRIP_FRAMES = FRAME_TILTS.map((tilt, index) => ({
  id: `frame-${index}`,
  transform: `rotate(${tilt}deg)`,
}));

export const EventsFilmstrip: FC = () => (
  <Stack
    aria-hidden
    direction="row"
    data-kk-events-filmstrip
    sx={{ gap: 2, justifyContent: 'center' }}
  >
    {FILMSTRIP_FRAMES.map((frame) => (
      <Box key={frame.id} sx={{ width: '11rem', flexShrink: 0, transform: frame.transform }}>
        <KkPhotoPlaceholder label="event-foto" aspectRatio={kkTokens.aspectRatio.landscape} />
      </Box>
    ))}
  </Stack>
);

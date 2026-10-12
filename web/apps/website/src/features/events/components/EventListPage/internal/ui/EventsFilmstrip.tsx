import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { WebsitePicture } from '@/components/WebsitePicture';
import { filmstripFramesOf } from '@/features/events/filmstrip-frames';
import { useFilledSlotPositions } from '@/lib/website-pictures/use-slot-positions';

const FILMSTRIP_FRAME_SIZES = '176px';

export const EventsFilmstrip: FC = () => {
  const frames = filmstripFramesOf(useFilledSlotPositions('events.filmstrip'));

  if (frames.length === 0) {
    return null;
  }

  return (
    <Stack
      aria-hidden
      direction="row"
      data-kk-events-filmstrip
      sx={{ gap: 2, justifyContent: 'center' }}
    >
      {frames.map((frame) => (
        <Box
          key={frame.position}
          sx={{ width: '11rem', flexShrink: 0, transform: frame.transform }}
        >
          <WebsitePicture
            slot="events.filmstrip"
            position={frame.position}
            sizes={FILMSTRIP_FRAME_SIZES}
          />
        </Box>
      ))}
    </Stack>
  );
};

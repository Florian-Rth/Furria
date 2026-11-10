import { kkTokens } from '@furria/ui/tokens';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { WebsitePicture } from '@/components/WebsitePicture';
import { eventsFilmstripFrames } from '@/features/events/filmstrip-frames';

const FILMSTRIP_FRAME_SIZES = '176px';
const { gutterX } = kkTokens.layout;
const BLEED_X = { xs: -gutterX.xs, md: -gutterX.md };

export const EventsFilmstrip: FC = () => (
  <Stack
    aria-hidden
    direction="row"
    data-kk-events-filmstrip
    sx={{
      gap: 2,
      mx: BLEED_X,
      px: gutterX,
      py: 2,
      overflowX: 'auto',
      overscrollBehaviorX: 'contain',
      scrollSnapType: 'x mandatory',
      scrollPaddingInline: (theme) => theme.spacing(gutterX.xs),
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
      '& > :first-of-type': { marginInlineStart: 'auto' },
      '& > :last-of-type': { marginInlineEnd: 'auto' },
    }}
  >
    {eventsFilmstripFrames.map((frame) => (
      <Box
        key={frame.position}
        sx={{
          width: '11rem',
          flexShrink: 0,
          scrollSnapAlign: 'start',
          transform: frame.transform,
        }}
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

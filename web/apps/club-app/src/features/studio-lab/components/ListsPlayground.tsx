import { DragDropProvider } from '@dnd-kit/react';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkTouchLab } from '@furria/ui/KkTouchLab';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ActStudio } from '@/features/acts/schemas';
import { POOL_ID, useListsPlayground } from '../hooks/use-lists-playground';
import { LISTS_HINT, OPEN_SPOT, SONGS_TITLE, SPOTS_TITLE } from '../studio-lab-copy';
import { HolderChip } from './HolderChip';
import { SongSortRow } from './SongSortRow';
import { SpotDropSlot } from './SpotDropSlot';
import { SpotSlot } from './SpotSlot';

interface ListsPlaygroundProps {
  studio: ActStudio;
}

export const ListsPlayground: FC<ListsPlaygroundProps> = ({ studio }) => {
  const playground = useListsPlayground(studio);

  return (
    <Stack sx={{ gap: 2 }}>
      <KkTouchLab.Hint text={LISTS_HINT} />
      <KkPanelSection title={SONGS_TITLE}>
        <DragDropProvider onDragEnd={playground.onSongDragEnd}>
          <Stack sx={{ gap: 0.75 }}>
            {playground.songs.map((song, index) => (
              <SongSortRow key={song.songId} song={song} index={index} />
            ))}
          </Stack>
        </DragDropProvider>
      </KkPanelSection>
      <KkPanelSection title={SPOTS_TITLE}>
        <DragDropProvider onDragEnd={playground.onSpotDragEnd}>
          <Grid container spacing={0.75}>
            {playground.spots.map((spot) => (
              <Grid key={spot.spotId} size={{ xs: 4, md: 3 }}>
                <SpotSlot spot={spot} />
              </Grid>
            ))}
            <Grid size={12}>
              <SpotDropSlot id={POOL_ID} label={OPEN_SPOT}>
                <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                  {playground.pool.map((holder) => (
                    <HolderChip key={holder.personId} holder={holder} />
                  ))}
                </Stack>
              </SpotDropSlot>
            </Grid>
          </Grid>
        </DragDropProvider>
      </KkPanelSection>
    </Stack>
  );
};

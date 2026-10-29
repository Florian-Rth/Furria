import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkNote } from '@furria/ui/KkNote';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { Studio } from '@/features/acts/schemas';
import { useStudioCDesk } from '../hooks/use-studio-c-desk';
import {
  STUDIO_C_EDIT_LATER,
  STUDIO_C_MUSIC_FAILED,
  STUDIO_C_NO_MUSIC_LINE,
  STUDIO_C_NO_MUSIC_TITLE,
} from '../studio-c-copy';
import { StudioCLanes } from './StudioCLanes';
import { StudioCMoment } from './StudioCMoment';
import { StudioCSideVideo } from './StudioCSideVideo';
import { StudioCTransport } from './StudioCTransport';
import { StudioCView } from './StudioCView';

interface StudioCDeskProps {
  studio: Studio;
  viewerId: number | null;
}

export const StudioCDesk: FC<StudioCDeskProps> = ({ studio, viewerId }) => {
  const desk = useStudioCDesk(studio, viewerId);

  if (desk.musicMissing) {
    return <KkEmptyState title={STUDIO_C_NO_MUSIC_TITLE} description={STUDIO_C_NO_MUSIC_LINE} />;
  }

  const musicFailed =
    desk.playback.state.load === 'failed' ? (
      <KkNote tone="warning" icon="alert">
        {STUDIO_C_MUSIC_FAILED}
      </KkNote>
    ) : null;

  return (
    <Stack sx={{ gap: { xs: 1.25, desktop: 2 }, minWidth: 0 }}>
      <Grid container spacing={{ xs: 1.25, desktop: 2 }}>
        <Grid size={{ xs: 12, desktop: 6 }}>
          <StudioCView desk={desk} studio={studio} />
        </Grid>
        <Grid size={{ xs: 12, desktop: 6 }}>
          <Stack sx={{ gap: { xs: 1, desktop: 2 }, minWidth: 0 }}>
            <StudioCSideVideo desk={desk} studio={studio} />
            <StudioCMoment playback={desk.playback} />
          </Stack>
        </Grid>
      </Grid>
      {musicFailed}
      <StudioCTransport desk={desk} />
      <StudioCLanes desk={desk} studio={studio} />
      <KkNote tone="muted" icon="edit">
        {STUDIO_C_EDIT_LATER}
      </KkNote>
    </Stack>
  );
};

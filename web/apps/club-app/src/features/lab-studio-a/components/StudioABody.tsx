import { KkNote } from '@furria/ui/KkNote';
import { KkStudioADeck } from '@furria/ui/KkStudioADeck';
import { KkStudioALayout } from '@furria/ui/KkStudioALayout';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { ActViewer, Studio } from '@/features/acts/schemas';
import { useStudioAPractice } from '../hooks/use-studio-a-practice';
import { useStudioAView } from '../hooks/use-studio-a-view';
import { STUDIO_A_DECK_LABEL, STUDIO_A_EDIT_LATER, STUDIO_A_LOAD_FAILED } from '../studio-a-copy';
import { StudioACountLayer } from './StudioACountLayer';
import { StudioALensLayer } from './StudioALensLayer';
import { StudioAManualLayer } from './StudioAManualLayer';
import { StudioAStageLayer } from './StudioAStageLayer';
import { StudioAStripLayer } from './StudioAStripLayer';
import { StudioATransportLayer } from './StudioATransportLayer';
import { StudioAVideoLayer } from './StudioAVideoLayer';

interface StudioABodyProps {
  studio: Studio;
  viewer: ActViewer;
  viewerId: number | null;
}

export const StudioABody: FC<StudioABodyProps> = ({ studio, viewer, viewerId }) => {
  const playback = useStudioPlayback(studio, viewerId);
  const practice = useStudioAPractice(playback);
  const view = useStudioAView();
  const failed =
    playback.state.load === 'failed' ? (
      <KkNote tone="warning">{STUDIO_A_LOAD_FAILED}</KkNote>
    ) : null;
  const editLater = viewer.canEditStudio ? <KkNote>{STUDIO_A_EDIT_LATER}</KkNote> : null;

  const video = <StudioAVideoLayer studio={studio} playback={playback} mirrored={view.mirrored} />;
  const stage = (
    <StudioAStageLayer
      studio={studio}
      playback={playback}
      practice={practice}
      mirrored={view.mirrored}
    />
  );
  const deck = (
    <KkStudioADeck label={STUDIO_A_DECK_LABEL}>
      <StudioACountLayer playback={playback} practice={practice} />
      <StudioAStripLayer playback={playback} practice={practice} />
      <StudioALensLayer playback={playback} />
      <StudioATransportLayer playback={playback} practice={practice} view={view} />
      {failed}
    </KkStudioADeck>
  );
  const manual = (
    <Stack sx={{ gap: 1.5 }}>
      <StudioAManualLayer
        studio={studio}
        playback={playback}
        practice={practice}
        mirrored={view.mirrored}
      />
      {editLater}
    </Stack>
  );

  return <KkStudioALayout video={video} stage={stage} deck={deck} manual={manual} />;
};

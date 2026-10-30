import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';
import type { ActStudioSongs } from '../hooks/use-act-studio-songs';
import { useSongDesk } from '../hooks/use-song-desk';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_SONG_DESK, STUDIO_SONG_DESK_CLOSE } from '../studio-copy';
import { ActStudioSongDeskBody } from './ActStudioSongDeskBody';

interface ActStudioSongDeskProps {
  screen: StudioScreen;
  songs: ActStudioSongs;
}

export const ActStudioSongDesk: FC<ActStudioSongDeskProps> = ({ screen, songs }) => {
  const desk = useSongDesk(screen, songs);
  const open = songs.deskOpen && desk !== null;
  const title = desk?.title ?? STUDIO_SONG_DESK;
  const body = desk === null ? null : <ActStudioSongDeskBody desk={desk} />;

  return (
    <KkPracticeSteps open={open} label={STUDIO_SONG_DESK} onClose={songs.closeDesk}>
      <KkPracticeSteps.Head>
        <KkPracticeSteps.Title text={title} />
        <KkPracticeSteps.Close label={STUDIO_SONG_DESK_CLOSE} onClose={songs.closeDesk} />
      </KkPracticeSteps.Head>
      <KkPracticeSteps.List>{body}</KkPracticeSteps.List>
    </KkPracticeSteps>
  );
};

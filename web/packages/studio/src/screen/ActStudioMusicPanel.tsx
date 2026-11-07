import { ActStudioFinalDesk } from '@furria/studio/ActStudioFinalDesk';
import { ActStudioSongDesk } from '@furria/studio/ActStudioSongDesk';
import { ActStudioSongList } from '@furria/studio/ActStudioSongList';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioFinal } from '@furria/studio/use-act-studio-final';
import type { ActStudioSongs } from '@furria/studio/use-act-studio-songs';
import { useFinalDesk } from '@furria/studio/use-final-desk';
import { useSongDesk } from '@furria/studio/use-song-desk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';

interface ActStudioMusicPanelProps {
  screen: StudioScreen;
  songs: ActStudioSongs;
  finalList: ActStudioFinal;
}

export const ActStudioMusicPanel: FC<ActStudioMusicPanelProps> = ({ screen, songs, finalList }) => {
  const songDesk = useSongDesk(screen, songs);
  const finalDesk = useFinalDesk(screen, finalList);

  if (songs.deskOpen && songDesk !== null) {
    return <ActStudioSongDesk desk={songDesk} onClose={songs.closeDesk} />;
  }
  if (finalDesk !== null) {
    return <ActStudioFinalDesk desk={finalDesk} onClose={finalList.closeDesk} />;
  }

  return (
    <KkLaneInspector>
      <ActStudioSongList screen={screen} songs={songs} finalList={finalList} />
    </KkLaneInspector>
  );
};

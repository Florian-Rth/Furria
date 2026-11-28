import { ActStudioSongDesk } from '@furria/studio/ActStudioSongDesk';
import { ActStudioSongList } from '@furria/studio/ActStudioSongList';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioSongs } from '@furria/studio/use-act-studio-songs';
import { useSongDesk } from '@furria/studio/use-song-desk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';

interface ActStudioMusicPanelProps {
  screen: StudioScreen;
  songs: ActStudioSongs;
}

export const ActStudioMusicPanel: FC<ActStudioMusicPanelProps> = ({ screen, songs }) => {
  const songDesk = useSongDesk(screen, songs);

  if (songs.deskOpen && songDesk !== null) {
    return <ActStudioSongDesk desk={songDesk} onClose={songs.closeDesk} />;
  }

  return (
    <KkLaneInspector>
      <ActStudioSongList screen={screen} songs={songs} />
    </KkLaneInspector>
  );
};

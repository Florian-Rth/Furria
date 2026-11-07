import { ActStudioSongDeskBody } from '@furria/studio/ActStudioSongDeskBody';
import { STUDIO_SONG_DESK, STUDIO_SONG_DESK_CLOSE } from '@furria/studio/studio-copy';
import type { SongDesk } from '@furria/studio/use-song-desk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';

interface ActStudioSongDeskProps {
  desk: SongDesk;
  onClose: () => void;
}

export const ActStudioSongDesk: FC<ActStudioSongDeskProps> = ({ desk, onClose }) => (
  <KkLaneInspector>
    <KkLaneInspector.Top>
      <KkLaneInspector.Head eyebrow={STUDIO_SONG_DESK} title={desk.title} />
      <KkLaneInspector.Close label={STUDIO_SONG_DESK_CLOSE} onClose={onClose} />
    </KkLaneInspector.Top>
    <ActStudioSongDeskBody desk={desk} />
  </KkLaneInspector>
);

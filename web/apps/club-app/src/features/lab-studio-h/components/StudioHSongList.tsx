import { KkStudioHList } from '@furria/ui/KkStudioHList';
import type { FC } from 'react';
import type { StudioH } from '../hooks/use-studio-h';
import { useStudioHSongs } from '../hooks/use-studio-h-songs';
import { STUDIO_H_FINAL, STUDIO_H_FINAL_NONE, STUDIO_H_SONGS } from '../studio-h-copy';

interface StudioHSongListProps {
  h: StudioH;
}

export const StudioHSongList: FC<StudioHSongListProps> = ({ h }) => {
  const songs = useStudioHSongs(h);
  const rows = songs.map((song) => (
    <KkStudioHList.Row
      key={song.key}
      lead={song.lead}
      title={song.title}
      meta={song.meta}
      badge={null}
      badgeTone="quiet"
      selected={song.selected}
      label={song.label}
      onPress={song.press}
    />
  ));

  return (
    <KkStudioHList label={STUDIO_H_SONGS}>
      <KkStudioHList.Head text={STUDIO_H_SONGS} aside={String(songs.length)} />
      {rows}
      <KkStudioHList.Slot title={STUDIO_H_FINAL} text={STUDIO_H_FINAL_NONE} />
    </KkStudioHList>
  );
};

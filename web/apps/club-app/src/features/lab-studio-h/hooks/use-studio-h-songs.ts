import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import { songCardMetaOf, songNameOf, songRowLabelOf } from '../studio-h-copy';
import type { StudioH } from './use-studio-h';

export interface StudioHSongRow {
  key: string;
  lead: string;
  title: string;
  meta: string;
  label: string;
  selected: boolean;
  press: () => void;
}

export const useStudioHSongs = (h: StudioH): StudioHSongRow[] => {
  const { playback, studio } = h;
  const { player, segments } = playback;
  const songs = [...studio.songs].sort((left, right) => left.position - right.position);
  const current = usePlaybackSelection(player, (seconds) =>
    segments.findIndex(
      (segment) => seconds >= segment.timelineStart && seconds < segment.timelineEnd,
    ),
  );

  return songs.map((song, index) => {
    const name = songNameOf(song.fileName);

    return {
      key: String(song.songId),
      lead: String(index + 1),
      title: name,
      meta: songCardMetaOf(song.startSeconds, song.endSeconds, song.durationSeconds, song.tempoBpm),
      label: songRowLabelOf(name),
      selected: index === current,
      press: () => {
        player.seek(segments[index]?.timelineStart ?? 0);
      },
    };
  });
};

import type { KkStudioListBadgeTone } from '@furria/ui/KkStudioList';
import { useState } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import type { StudioSong } from '@/features/acts/schemas';
import {
  outsideMusicTextOf,
  STUDIO_EDIT,
  songCardMetaOf,
  songEditLabelOf,
  songNameOf,
  songRowLabelOf,
  songStateMetaOf,
} from '../studio-copy';
import { outsideMusicOf } from '../studio-music';
import type { StudioScreen } from './use-studio-screen';

export interface ActStudioSongRow {
  key: string;
  lead: string;
  title: string;
  meta: string;
  label: string;
  badge: string | null;
  badgeTone: KkStudioListBadgeTone;
  selected: boolean;
  press: () => void;
}

export interface CurrentSong {
  song: StudioSong;
  segment: MusicSegment;
  index: number;
}

export interface ActStudioSongs {
  rows: ActStudioSongRow[];
  current: CurrentSong | null;
  outside: string | null;
  count: string;
  locked: boolean;
  deskOpen: boolean;
  closeDesk: () => void;
}

export const useActStudioSongs = (screen: StudioScreen): ActStudioSongs => {
  const { playback, studio, mode } = screen;
  const { player, segments } = playback;
  const [deskOpen, setDeskOpen] = useState(false);
  const onMusic = mode.editing && mode.tool === 'music';
  if (deskOpen && !onMusic) {
    setDeskOpen(false);
  }
  const editable = studio.music.source === 'workingMix';
  const songs = [...studio.songs].sort((left, right) => left.position - right.position);
  const currentIndex = usePlaybackSelection(player, (seconds) =>
    segments.findIndex(
      (segment) => seconds >= segment.timelineStart && seconds < segment.timelineEnd,
    ),
  );
  const selectedIndex = editable ? currentIndex : -1;
  const currentSong = songs[selectedIndex];
  const currentSegment = segments[selectedIndex];
  const outside = outsideMusicOf(studio, segments);

  return {
    rows: songs.map((song, index) => {
      const name = songNameOf(song.fileName);
      const selected = index === selectedIndex;

      return {
        key: String(song.songId),
        lead: String(index + 1),
        title: name,
        meta:
          songStateMetaOf(song.state) ??
          songCardMetaOf(song.startSeconds, song.endSeconds, song.durationSeconds, song.tempoBpm),
        label: selected ? songEditLabelOf(name) : songRowLabelOf(name),
        badge: selected ? STUDIO_EDIT : null,
        badgeTone: 'ink',
        selected,
        press: () => {
          if (!editable) {
            return;
          }
          if (selected) {
            setDeskOpen(onMusic);
            return;
          }
          player.seek(segments[index]?.timelineStart ?? 0);
        },
      };
    }),
    current:
      currentSong !== undefined && currentSegment !== undefined
        ? { song: currentSong, segment: currentSegment, index: selectedIndex }
        : null,
    count: String(songs.length),
    outside: outsideMusicTextOf(outside),
    locked: !editable,
    deskOpen,
    closeDesk: () => {
      setDeskOpen(false);
    },
  };
};

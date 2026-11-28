import type { DragEndEvent } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import type { MusicSegment } from '@furria/studio/music-timeline';
import {
  outsideMusicTextOf,
  STUDIO_SONG_GONE,
  songCardMetaOf,
  songEditLabelOf,
  songMoveLabelOf,
  songNameOf,
  songRowLabelOf,
  songSpokenNameOf,
  songStateMetaOf,
} from '@furria/studio/studio-copy';
import { studioDragPluginsOf } from '@furria/studio/studio-drag-copy';
import { STUDIO_EDIT } from '@furria/studio/studio-mode-copy';
import {
  keptPositionOf,
  movedOrderOf,
  outsideMusicOf,
  segmentOfSong,
  songOfSegment,
} from '@furria/studio/studio-music';
import type { StudioSong } from '@furria/studio/studio-schemas';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { useSheetTarget } from '@furria/studio/use-sheet-target';
import type { KkStudioListBadgeTone } from '@furria/ui/KkStudioList';

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

export interface ActStudioSortableSongRow extends ActStudioSongRow {
  moveLabel: string;
}

export interface CurrentSong {
  song: StudioSong;
  segment: MusicSegment;
  index: number;
}

export interface ActStudioSongs {
  rows: ActStudioSortableSongRow[];
  current: CurrentSong | null;
  outside: string | null;
  count: string;
  dragPlugins: ReturnType<typeof studioDragPluginsOf>;
  onDragEnd: (event: DragEndEvent) => void;
  deskOpen: boolean;
  closeDesk: () => void;
}

export const useActStudioSongs = (screen: StudioScreen): ActStudioSongs => {
  const { playback, studio, mode, edits } = screen;
  const work = screen.document;
  const { player, segments } = playback;
  const onMusic = mode.editing && mode.tool === 'music';
  const desk = useSheetTarget(
    studio.songs.map((song) => song.songId),
    onMusic,
    STUDIO_SONG_GONE,
  );
  const songs = [...studio.songs].sort((left, right) => left.position - right.position);
  const playingIndex = usePlaybackSelection(player, (seconds) =>
    segments.findIndex(
      (segment) => seconds >= segment.timelineStart && seconds < segment.timelineEnd,
    ),
  );
  const playing = segments[playingIndex];
  const playingSong = playing === undefined ? null : songOfSegment(songs, playing);
  const currentSong = songs.find((song) => song.songId === desk.targetId) ?? playingSong;
  const selectedIndex = currentSong === null ? -1 : songs.indexOf(currentSong);
  const currentSegment = currentSong === null ? null : segmentOfSong(segments, currentSong.songId);
  const outside = outsideMusicOf(studio, segments);
  const spokenNameOf = (song: StudioSong, index: number): string =>
    songSpokenNameOf(
      song.fileName,
      index + 1,
      songs.some(
        (candidate) =>
          candidate.songId !== song.songId && candidate.mediaItemId === song.mediaItemId,
      ),
    );
  const songTitleOf = (key: string | number): string => {
    const index = songs.findIndex((candidate) => String(candidate.songId) === String(key));
    const song = songs[index];

    return song === undefined ? String(key) : spokenNameOf(song, index);
  };
  const reorder = (from: number, to: number): void => {
    const order = movedOrderOf(studio.songs, from, to);
    if (order === null) {
      return;
    }
    const kept = keptPositionOf(studio.songs, segments, order, player.position());
    if (kept !== null) {
      edits.keepPosition(kept);
    }
    work.change({ kind: 'songOrder', songIds: order });
  };

  return {
    rows: songs.map((song, index) => {
      const name = songNameOf(song.fileName);
      const spoken = spokenNameOf(song, index);
      const selected = index === selectedIndex;

      return {
        key: String(song.songId),
        lead: String(index + 1),
        title: name,
        meta:
          songStateMetaOf(song.state) ?? songCardMetaOf(song, song.durationSeconds, song.tempoBpm),
        label: selected ? songEditLabelOf(spoken) : songRowLabelOf(spoken),
        moveLabel: songMoveLabelOf(spoken),
        badge: selected ? STUDIO_EDIT : null,
        badgeTone: 'ink',
        selected,
        press: () => {
          if (selected) {
            desk.open(song.songId);
            return;
          }
          player.seek(segmentOfSong(segments, song.songId)?.timelineStart ?? 0);
        },
      };
    }),
    current:
      currentSong !== null && currentSegment !== null
        ? { song: currentSong, segment: currentSegment, index: selectedIndex }
        : null,
    count: String(songs.length),
    outside: outsideMusicTextOf(outside),
    dragPlugins: studioDragPluginsOf({ itemOf: songTitleOf, targetOf: songTitleOf }),
    onDragEnd: (event) => {
      const source = event.operation.source;
      if (event.canceled || !isSortable(source)) {
        return;
      }
      reorder(source.initialIndex, source.index);
    },
    deskOpen: desk.targetId !== null,
    closeDesk: desk.close,
  };
};

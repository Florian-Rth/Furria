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
  songStateMetaOf,
} from '@furria/studio/studio-copy';
import { studioDragPluginsOf } from '@furria/studio/studio-drag-copy';
import { STUDIO_EDIT } from '@furria/studio/studio-mode-copy';
import {
  deskSegmentIndexOf,
  keptPositionOf,
  movedOrderOf,
  outsideMusicOf,
  songOfSegment,
} from '@furria/studio/studio-music';
import type { StudioSong } from '@furria/studio/studio-schemas';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { useSheetTarget } from '@furria/studio/use-sheet-target';
import type { KkStudioListBadgeTone } from '@furria/ui/KkStudioList';
import { useState } from 'react';

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
  pieceIndex: number;
}

export interface ActStudioSongs {
  rows: ActStudioSortableSongRow[];
  current: CurrentSong | null;
  outside: string | null;
  count: string;
  locked: boolean;
  dragPlugins: ReturnType<typeof studioDragPluginsOf>;
  onDragEnd: (event: DragEndEvent) => void;
  deskOpen: boolean;
  closeDesk: () => void;
  holdPiece: (sourceStart: number) => void;
}

interface HeldPiece {
  songId: number;
  sourceStart: number;
}

export const useActStudioSongs = (screen: StudioScreen): ActStudioSongs => {
  const { playback, studio, mode, edits } = screen;
  const work = screen.document;
  const { player, segments } = playback;
  const onMusic = mode.editing && mode.tool === 'music';
  const editable = studio.music.source === 'workingMix';
  const desk = useSheetTarget(
    studio.songs.map((song) => song.songId),
    onMusic && editable,
    STUDIO_SONG_GONE,
  );
  const [held, setHeld] = useState<HeldPiece | null>(null);
  if (held !== null && desk.targetId !== held.songId) {
    setHeld(null);
  }
  const songs = [...studio.songs].sort((left, right) => left.position - right.position);
  const playingIndex = usePlaybackSelection(player, (seconds) =>
    segments.findIndex(
      (segment) => seconds >= segment.timelineStart && seconds < segment.timelineEnd,
    ),
  );
  const playing = segments[playingIndex];
  const playingSong = playing === undefined ? null : songOfSegment(songs, playing);
  const boundSong = songs.find((song) => song.songId === desk.targetId) ?? playingSong;
  const currentSong = editable ? (boundSong ?? undefined) : undefined;
  const selectedIndex = currentSong === undefined ? -1 : songs.indexOf(currentSong);
  const firstSegmentOf = (song: StudioSong): MusicSegment | undefined =>
    segments.find((segment) => segment.mediaItemId === song.mediaItemId);
  const heldStart = held?.songId === currentSong?.songId ? (held?.sourceStart ?? null) : null;
  const deskIndex = usePlaybackSelection(player, (seconds) =>
    currentSong === undefined
      ? -1
      : deskSegmentIndexOf(segments, currentSong.mediaItemId, seconds, heldStart),
  );
  const currentSegment = segments[deskIndex];
  const outside = outsideMusicOf(studio, segments);
  const songTitleOf = (key: string | number): string => {
    const song = songs.find((candidate) => String(candidate.songId) === String(key));

    return song === undefined ? String(key) : songNameOf(song.fileName);
  };
  const reorder = (from: number, to: number): void => {
    const order = movedOrderOf(studio.songs, from, to);
    if (!editable || order === null) {
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
      const selected = index === selectedIndex;

      return {
        key: String(song.songId),
        lead: String(index + 1),
        title: name,
        meta:
          songStateMetaOf(song.state) ??
          songCardMetaOf(song.pieces, song.durationSeconds, song.tempoBpm),
        label: selected ? songEditLabelOf(name) : songRowLabelOf(name),
        moveLabel: songMoveLabelOf(name),
        badge: selected ? STUDIO_EDIT : null,
        badgeTone: 'ink',
        selected,
        press: () => {
          if (!editable) {
            return;
          }
          if (selected) {
            desk.open(song.songId);
            return;
          }
          player.seek(firstSegmentOf(song)?.timelineStart ?? 0);
        },
      };
    }),
    current:
      currentSong !== undefined && currentSegment !== undefined
        ? {
            song: currentSong,
            segment: currentSegment,
            index: selectedIndex,
            pieceIndex: currentSong.pieces.findIndex(
              (piece) => piece.startSeconds === currentSegment.sourceStart,
            ),
          }
        : null,
    count: String(songs.length),
    outside: outsideMusicTextOf(outside),
    locked: !editable,
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
    holdPiece: (sourceStart) => {
      if (desk.targetId !== null) {
        setHeld({ songId: desk.targetId, sourceStart });
      }
    },
  };
};

import { useState } from 'react';
import {
  firstBeatTextOf,
  songNameOf,
  tempoNudgeLabelOf,
  tempoNudgeTextOf,
  tempoTextOf,
} from '../studio-copy';
import type { SongSettings, SongShift } from '../studio-music';
import {
  firstBeatAtOf,
  nudgedFirstBeatOf,
  shiftedOrderOf,
  songSettingsOf,
  startInOrderOf,
  steppedTempoOf,
} from '../studio-music';
import type { ActStudioSongs } from './use-act-studio-songs';
import type { StudioScreen } from './use-studio-screen';

export const SLOWER_NUDGES: readonly number[] = [-1, -0.1];
export const FASTER_NUDGES: readonly number[] = [0.1, 1];
export const BEAT_NUDGE_SECONDS = 0.02;
export const FALLBACK_TEMPO_BPM = 120;

export interface SongDeskNudge {
  key: string;
  text: string;
  label: string;
  press: () => void;
}

export interface SongDesk {
  title: string;
  tempoText: string;
  slower: SongDeskNudge[];
  faster: SongDeskNudge[];
  beatText: string;
  beatLocked: boolean;
  placeOne: () => void;
  nudgeOne: (direction: -1 | 1) => void;
  shiftLocked: Record<SongShift, boolean>;
  shift: (direction: SongShift) => void;
  removing: boolean;
  remove: () => void;
}

export const useSongDesk = (screen: StudioScreen, songs: ActStudioSongs): SongDesk | null => {
  const { music, playback, studio, edits } = screen;
  const { player } = playback;
  const current = songs.current;
  const [removingId, setRemovingId] = useState<number | null>(null);
  if (removingId !== null && (!songs.deskOpen || current?.song.songId !== removingId)) {
    setRemovingId(null);
  }

  if (current === null) {
    return null;
  }

  const { song, segment } = current;
  const settle = (change: Partial<SongSettings>): void => {
    music.settle.mutate({ songId: song.songId, settings: { ...songSettingsOf(song), ...change } });
  };
  const tempoNudgeOf = (delta: number): SongDeskNudge => ({
    key: String(delta),
    text: tempoNudgeTextOf(delta),
    label: tempoNudgeLabelOf(delta),
    press: () => {
      settle({ tempoBpm: steppedTempoOf(song.tempoBpm ?? FALLBACK_TEMPO_BPM, delta) });
    },
  });
  const orderOf = (direction: SongShift): number[] | null =>
    shiftedOrderOf(studio.songs, song.songId, direction);

  return {
    title: songNameOf(song.fileName),
    tempoText: tempoTextOf(song.tempoBpm),
    slower: SLOWER_NUDGES.map(tempoNudgeOf),
    faster: FASTER_NUDGES.map(tempoNudgeOf),
    beatText: firstBeatTextOf(song.firstBeatSeconds),
    beatLocked: song.firstBeatSeconds === null,
    placeOne: () => {
      settle({ firstBeatSeconds: firstBeatAtOf(song, segment, player.position()) });
    },
    nudgeOne: (direction) => {
      settle({ firstBeatSeconds: nudgedFirstBeatOf(song, direction * BEAT_NUDGE_SECONDS) });
    },
    shiftLocked: { earlier: orderOf('earlier') === null, later: orderOf('later') === null },
    shift: (direction) => {
      const order = orderOf(direction);
      if (order === null) {
        return;
      }
      const offset = player.position() - segment.timelineStart;
      edits.keepPosition(startInOrderOf(studio.songs, order, song.songId) + offset);
      music.reorder.mutate(order);
    },
    removing: removingId === song.songId,
    remove: () => {
      if (removingId !== song.songId) {
        setRemovingId(song.songId);
        return;
      }
      setRemovingId(null);
      songs.closeDesk();
      edits.keepPosition(segment.timelineStart);
      music.remove.mutate(song.songId);
    },
  };
};

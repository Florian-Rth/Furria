import type { CutDesk } from '@furria/studio/cut-desk';
import { cutDeskOf } from '@furria/studio/cut-desk';
import {
  firstBeatTextOf,
  songDeskTitleOf,
  songNameOf,
  tempoNudgeLabelOf,
  tempoNudgeTextOf,
  tempoTextOf,
} from '@furria/studio/studio-copy';
import type { CutEdge, CutRoom, CutSpan } from '@furria/studio/studio-cuts';
import { playheadInOf, shiftedPositionOf } from '@furria/studio/studio-cuts';
import type { SongSettings } from '@furria/studio/studio-document';
import {
  firstBeatAtOf,
  nudgedFirstBeatOf,
  songRoomOf,
  songSettingsOf,
  steppedTempoOf,
} from '@furria/studio/studio-music';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioSongs } from '@furria/studio/use-act-studio-songs';
import { useCutReach } from '@furria/studio/use-cut-reach';
import { useState } from 'react';

export const SLOWER_NUDGES: readonly number[] = [-1, -0.1];
export const FASTER_NUDGES: readonly number[] = [0.1, 1];
export const BEAT_NUDGE_SECONDS = 0.02;
export const FALLBACK_TEMPO_BPM = 120;

const NO_ROOM: CutRoom = { lowest: 0, highest: 0 };

export interface SongDeskNudge {
  key: string;
  text: string;
  label: string;
  disabled?: boolean;
  press: () => void;
}

export interface SongDesk {
  title: string;
  cut: CutDesk;
  tempoText: string;
  slower: SongDeskNudge[];
  faster: SongDeskNudge[];
  beatText: string;
  beatLocked: boolean;
  placeOne: () => void;
  nudgeOne: (direction: -1 | 1) => void;
  removing: boolean;
  remove: () => void;
}

export const useSongDesk = (screen: StudioScreen, songs: ActStudioSongs): SongDesk | null => {
  const { playback, edits, studio } = screen;
  const work = screen.document;
  const { player } = playback;
  const current = songs.current;
  const [removingId, setRemovingId] = useState<number | null>(null);
  if (removingId !== null && (!songs.deskOpen || current?.song.songId !== removingId)) {
    setRemovingId(null);
  }
  const room = current === null ? NO_ROOM : songRoomOf(studio.songs, current.song);
  const playheadAt = (seconds: number): number | null =>
    current === null
      ? null
      : playheadInOf(
          current.segment.timelineStart,
          current.segment.timelineEnd,
          current.segment.sourceStart,
          seconds,
        );
  const reach = useCutReach(player, current?.song ?? null, room, playheadAt);

  if (current === null) {
    return null;
  }

  const { song, segment } = current;
  const forgetPosition = (): void => {
    edits.keepPosition(null);
  };
  const settle = (change: Partial<SongSettings>): void => {
    work.change({ kind: 'songSettings', songId: song.songId, ...songSettingsOf(song), ...change });
  };
  const trim = (edge: CutEdge, next: CutSpan): void => {
    const position = player.position();
    if (edge === 'start') {
      const removed = next.startSeconds - song.startSeconds;
      edits.keepPosition(shiftedPositionOf(position, segment.timelineStart, removed));
    } else {
      const grown = next.endSeconds - song.endSeconds;
      edits.keepPosition(
        shiftedPositionOf(position, segment.timelineEnd + Math.min(0, grown), -grown),
      );
    }
    settle({ startSeconds: next.startSeconds, endSeconds: next.endSeconds });
  };
  const tempoNudgeOf = (delta: number): SongDeskNudge => ({
    key: String(delta),
    text: tempoNudgeTextOf(delta),
    label: tempoNudgeLabelOf(delta),
    press: () => {
      settle({ tempoBpm: steppedTempoOf(song.tempoBpm ?? FALLBACK_TEMPO_BPM, delta) });
    },
  });

  return {
    title: songDeskTitleOf(current.index + 1, songNameOf(song.fileName)),
    cut: cutDeskOf({
      cut: song,
      room,
      reach: { ...reach, split: reach.split && !screen.songs.splitting },
      playhead: () => playheadAt(player.position()),
      trim,
      split: (atSeconds) => {
        edits.keepPosition(player.position());
        void screen.songs.split({ songId: song.songId, atSeconds }).catch(forgetPosition);
      },
    }),
    tempoText: tempoTextOf(song.tempoBpm),
    slower: SLOWER_NUDGES.map(tempoNudgeOf),
    faster: FASTER_NUDGES.map(tempoNudgeOf),
    beatText: firstBeatTextOf(song.firstBeatSeconds),
    beatLocked: song.firstBeatSeconds === null,
    placeOne: () => {
      const seconds = player.position();
      if (playheadAt(seconds) !== null) {
        settle({ firstBeatSeconds: firstBeatAtOf(song, segment, seconds) });
      }
    },
    nudgeOne: (direction) => {
      settle({ firstBeatSeconds: nudgedFirstBeatOf(song, direction * BEAT_NUDGE_SECONDS) });
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
      void screen.songs.remove(song.songId).catch(forgetPosition);
    },
  };
};

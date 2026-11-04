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
import type { CutEdge, CutSpan } from '@furria/studio/studio-cuts';
import { playheadInOf, removedPiecesOf, shiftedPositionOf } from '@furria/studio/studio-cuts';
import type { SongSettings } from '@furria/studio/studio-music';
import {
  firstBeatAtOf,
  nudgedFirstBeatOf,
  songLimitOf,
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

export interface SongDeskNudge {
  key: string;
  text: string;
  label: string;
  disabled?: boolean;
  press: () => void;
}

export interface SongDeskPieceRemoval {
  sure: boolean;
  press: () => void;
}

export interface SongDesk {
  title: string;
  cut: CutDesk;
  pieceRemoval: SongDeskPieceRemoval | null;
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

interface PieceRemoving {
  songId: number;
  pieceIndex: number;
}

export const useSongDesk = (screen: StudioScreen, songs: ActStudioSongs): SongDesk | null => {
  const { playback, edits } = screen;
  const work = screen.document;
  const { player } = playback;
  const current = songs.current;
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [removingPiece, setRemovingPiece] = useState<PieceRemoving | null>(null);
  if (removingId !== null && (!songs.deskOpen || current?.song.songId !== removingId)) {
    setRemovingId(null);
  }
  if (
    removingPiece !== null &&
    (!songs.deskOpen ||
      current?.song.songId !== removingPiece.songId ||
      current.pieceIndex !== removingPiece.pieceIndex)
  ) {
    setRemovingPiece(null);
  }
  const playheadAt = (seconds: number): number | null =>
    current === null
      ? null
      : playheadInOf(
          current.segment.timelineStart,
          current.segment.timelineEnd,
          current.segment.sourceStart,
          seconds,
        );
  const reach = useCutReach(
    player,
    current?.song.pieces ?? [],
    current?.pieceIndex ?? -1,
    current === null ? null : songLimitOf(current.song),
    playheadAt,
  );

  if (current === null) {
    return null;
  }

  const { song, segment, pieceIndex } = current;
  const piece = song.pieces[pieceIndex];
  const settle = (change: Partial<SongSettings>): void => {
    work.change({ kind: 'songSettings', songId: song.songId, ...songSettingsOf(song), ...change });
  };
  const cutTo = (pieces: CutSpan[], kept: number): void => {
    edits.keepPosition(kept);
    settle({ pieces });
  };
  const trim = (edge: CutEdge, pieces: CutSpan[]): void => {
    const next = pieces[pieceIndex];
    if (piece === undefined || next === undefined) {
      return;
    }
    const position = player.position();
    if (edge === 'start') {
      const removed = next.startSeconds - piece.startSeconds;
      cutTo(pieces, shiftedPositionOf(position, segment.timelineStart, removed));
      return;
    }
    const grown = next.endSeconds - piece.endSeconds;
    songs.holdPiece(piece.startSeconds);
    cutTo(pieces, shiftedPositionOf(position, segment.timelineEnd + Math.min(0, grown), -grown));
  };
  const tempoNudgeOf = (delta: number): SongDeskNudge => ({
    key: String(delta),
    text: tempoNudgeTextOf(delta),
    label: tempoNudgeLabelOf(delta),
    press: () => {
      settle({ tempoBpm: steppedTempoOf(song.tempoBpm ?? FALLBACK_TEMPO_BPM, delta) });
    },
  });
  const removedPieces = removedPiecesOf(song.pieces, pieceIndex);
  const pieceSure =
    removingPiece?.songId === song.songId && removingPiece.pieceIndex === pieceIndex;

  return {
    title: songDeskTitleOf(
      current.index + 1,
      songNameOf(song.fileName),
      pieceIndex + 1,
      song.pieces.length,
    ),
    cut: cutDeskOf({
      pieces: song.pieces,
      index: pieceIndex,
      limit: songLimitOf(song),
      reach,
      playhead: () => playheadAt(player.position()),
      trim,
      split: (_, pieces) => {
        cutTo(pieces, player.position());
      },
    }),
    pieceRemoval:
      removedPieces === null
        ? null
        : {
            sure: pieceSure,
            press: () => {
              if (!pieceSure) {
                setRemovingPiece({ songId: song.songId, pieceIndex });
                return;
              }
              setRemovingPiece(null);
              cutTo(
                removedPieces,
                shiftedPositionOf(
                  player.position(),
                  segment.timelineStart,
                  segment.timelineEnd - segment.timelineStart,
                ),
              );
            },
          },
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
    removing: removingId === song.songId,
    remove: () => {
      if (removingId !== song.songId) {
        setRemovingId(song.songId);
        return;
      }
      setRemovingId(null);
      songs.closeDesk();
      edits.keepPosition(segment.timelineStart);
      screen.songs.remove(song.songId);
    },
  };
};

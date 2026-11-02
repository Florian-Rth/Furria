import type { StudioFinalTrack } from '@furria/studio/studio-schemas';
import type { FinalTrackMatches } from '../schemas';
import {
  finalShiftNudgeLabelOf,
  finalTitleOf,
  firstBeatTextOf,
  offsetTextOf,
  tempoNudgeLabelOf,
  tempoNudgeTextOf,
  tempoTextOf,
} from '../studio-copy';
import {
  finalBeatAtOf,
  nudgedFinalBeatOf,
  offsetStartingAt,
  stretchOf,
  tunedOffsetOf,
} from '../studio-final';
import { steppedTempoOf } from '../studio-music';
import type { ActStudioFinal, CurrentSource } from './use-act-studio-final';
import type { SongDeskNudge } from './use-song-desk';
import {
  BEAT_NUDGE_SECONDS,
  FALLBACK_TEMPO_BPM,
  FASTER_NUDGES,
  SLOWER_NUDGES,
} from './use-song-desk';
import type { StudioScreen } from './use-studio-screen';

const EARLIER_SHIFTS: readonly number[] = [-0.1, -0.02];
const LATER_SHIFTS: readonly number[] = [0.02, 0.1];

export interface FinalSourceDesk {
  kind: 'source';
  title: string;
  offsetText: string;
  earlier: SongDeskNudge[];
  later: SongDeskNudge[];
  shiftLocked: boolean;
  startHere: () => void;
  matching: boolean;
  match: () => void;
}

export interface FinalGridDesk {
  kind: 'grid';
  title: string;
  tempoText: string;
  slower: SongDeskNudge[];
  faster: SongDeskNudge[];
  beatText: string;
  beatLocked: boolean;
  placeOne: () => void;
  nudgeOne: (direction: -1 | 1) => void;
}

export type FinalDesk = FinalSourceDesk | FinalGridDesk;

export const useFinalDesk = (screen: StudioScreen, list: ActStudioFinal): FinalDesk | null => {
  const { final, playback } = screen;
  const work = screen.document;
  const { player } = playback;
  const pending = final.pending;

  const sourceDeskOf = (track: StudioFinalTrack, current: CurrentSource): FinalSourceDesk => {
    const mediaItemId = current.place.segment.mediaItemId;
    const offset = final.placements[mediaItemId]?.offsetSeconds ?? null;
    const stretch = stretchOf(final.placements, mediaItemId);
    const tune = (offsetSeconds: number): void => {
      work.change({
        kind: 'finalOffset',
        finalTrackId: track.finalTrackId,
        sourceMediaItemId: mediaItemId,
        offsetSeconds,
        stretch,
      });
    };
    const shiftOf = (delta: number): SongDeskNudge => ({
      key: String(delta),
      text: offsetTextOf(delta),
      label: finalShiftNudgeLabelOf(delta),
      press: () => {
        if (offset !== null) {
          tune(tunedOffsetOf(offset, delta));
        }
      },
    });

    return {
      kind: 'source',
      title: current.name,
      offsetText: offset === null ? '–' : offsetTextOf(offset),
      earlier: EARLIER_SHIFTS.map(shiftOf),
      later: LATER_SHIFTS.map(shiftOf),
      shiftLocked: offset === null,
      startHere: () => {
        tune(offsetStartingAt(current.place.segment, player.position(), stretch));
      },
      matching: final.writes.match.isPending,
      match: () => {
        const matched = ({ matches }: FinalTrackMatches): void => {
          work.startGesture();
          try {
            for (const found of matches) {
              work.change({
                kind: 'finalOffset',
                finalTrackId: track.finalTrackId,
                sourceMediaItemId: found.sourceMediaItemId,
                offsetSeconds: found.offsetSeconds,
                stretch: found.stretch,
              });
            }
          } finally {
            work.endGesture();
          }
        };
        void final.writes.match.mutateAsync(track.finalTrackId).then(matched, () => undefined);
      },
    };
  };

  const gridDeskOf = (track: StudioFinalTrack): FinalGridDesk => {
    const settle = (change: { firstBeatSeconds?: number | null; tempoBpm?: number }): void => {
      work.change({
        kind: 'finalBeat',
        finalTrackId: track.finalTrackId,
        firstBeatSeconds: track.firstBeatSeconds,
        tempoBpm: track.tempoBpm,
        ...change,
      });
    };
    const tempoNudgeOf = (delta: number): SongDeskNudge => ({
      key: String(delta),
      text: tempoNudgeTextOf(delta),
      label: tempoNudgeLabelOf(delta),
      press: () => {
        settle({ tempoBpm: steppedTempoOf(track.tempoBpm ?? FALLBACK_TEMPO_BPM, delta) });
      },
    });

    return {
      kind: 'grid',
      title: finalTitleOf(track.version),
      tempoText: tempoTextOf(track.tempoBpm),
      slower: SLOWER_NUDGES.map(tempoNudgeOf),
      faster: FASTER_NUDGES.map(tempoNudgeOf),
      beatText: firstBeatTextOf(track.firstBeatSeconds),
      beatLocked: track.firstBeatSeconds === null,
      placeOne: () => {
        settle({ firstBeatSeconds: finalBeatAtOf(track, player.position()) });
      },
      nudgeOne: (direction) => {
        settle({ firstBeatSeconds: nudgedFinalBeatOf(track, direction * BEAT_NUDGE_SECONDS) });
      },
    };
  };

  if (list.desk === 'source' && pending !== null && list.current !== null) {
    return sourceDeskOf(pending, list.current);
  }

  return list.desk === 'grid' && final.adopted !== null ? gridDeskOf(final.adopted) : null;
};

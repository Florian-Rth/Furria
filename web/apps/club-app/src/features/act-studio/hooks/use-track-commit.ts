import type { TimedKeyframe } from '@furria/studio/choreography-motion';
import { anchoredTrackOf } from '../studio-formation';
import type { StudioScreen } from './use-studio-screen';

export type StudioTracks = Record<number, readonly TimedKeyframe[]>;

export interface TrackCommit {
  preview: (tracks: StudioTracks) => void;
  commit: (tracks: StudioTracks) => void;
  drop: (tracks: StudioTracks) => void;
}

export const useTrackCommit = (screen: StudioScreen): TrackCommit => {
  const { studio, edits, stageDocument, playback } = screen;

  return {
    preview: edits.setTracks,
    drop: edits.dropTracks,
    commit: (tracks) => {
      if (Object.keys(tracks).length === 0) {
        return;
      }
      const stored = studio.choreography?.tracks ?? [];
      const changes = Object.fromEntries(
        Object.entries(tracks).map(([spotId, keyframes]) => [
          spotId,
          anchoredTrackOf(
            stored.find((track) => track.spotId === Number(spotId))?.keyframes ?? [],
            keyframes,
            playback.segments,
            playback.stage,
          ),
        ]),
      );
      stageDocument.change({ kind: 'tracks', tracks: changes });
      edits.dropTracks(tracks);
    },
  };
};

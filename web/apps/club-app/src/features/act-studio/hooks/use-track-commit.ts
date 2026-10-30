import type { TimedKeyframe } from '@/features/act-player/choreography-motion';
import { anchoredTrackOf } from '../studio-formation';
import type { StudioScreen } from './use-studio-screen';

export type StudioTracks = Record<number, readonly TimedKeyframe[]>;

export interface TrackCommit {
  preview: (tracks: StudioTracks) => void;
  commit: (tracks: StudioTracks) => void;
}

export const useTrackCommit = (screen: StudioScreen): TrackCommit => {
  const { studio, edits, stageWrites, playback } = screen;

  return {
    preview: edits.setTracks,
    commit: (tracks) => {
      if (Object.keys(tracks).length === 0) {
        return;
      }
      edits.setTracks(tracks);
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
      const drop = (): void => {
        edits.dropTracks(tracks);
      };
      void stageWrites.save.mutateAsync(changes).then(drop, drop);
    },
  };
};

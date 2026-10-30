import type { KkStudioIStageGhost } from '@furria/ui/KkStudioIStage';
import {
  usePlaybackSeconds,
  usePlaybackSelection,
} from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { TimelineRange } from '@/features/act-player/music-timeline';
import type { StudioStage } from '@/features/acts/schemas';
import { draftPositionAt, shareOfPoint } from '../studio-i-formation';
import { shareIn } from '../studio-i-wave';
import type { StageLiveTrack } from './use-studio-i-stage';

export const usePlayheadShare = (player: MixPlayer, window: TimelineRange): number | null =>
  usePlaybackSelection(player, (seconds) =>
    seconds < window.start || seconds > window.end ? null : shareIn(window, seconds),
  );

export const useLivePoints = (
  player: MixPlayer,
  tracks: readonly StageLiveTrack[],
  stage: StudioStage,
): KkStudioIStageGhost[] => {
  const seconds = usePlaybackSeconds(player);

  return tracks.map((track) => ({
    key: String(track.move.spotId),
    ...shareOfPoint(draftPositionAt(track.path, track.move, seconds), stage),
  }));
};

import type { KkStudioHStagePoint } from '@furria/ui/KkStudioHStage';
import { poseAt } from '@/features/act-player/choreography-motion';
import { viewShareOf } from '@/features/act-practice/practice-stage';
import type { StudioH } from './use-studio-h';
import type { StudioHStage } from './use-studio-h-stage';

const SAMPLES = 24;
const EDGE_SECONDS = 1e-3;

export interface StudioHRoute {
  key: string;
  route: KkStudioHStagePoint[];
  keys: KkStudioHStagePoint[];
}

export const useStudioHRoutes = (h: StudioH, editor: StudioHStage): StudioHRoute[] => {
  const { playback, practice, mode } = h;
  const { paths, stage } = playback;
  const step = practice.step;

  if (mode.tool !== 'movement' || step === null || step.startSeconds === null) {
    return [];
  }

  const start = step.startSeconds;
  const end = step.endSeconds ?? start;

  return paths
    .filter((path) => editor.selected.includes(path.spotId))
    .map((path) => {
      const route = Array.from({ length: SAMPLES + 1 }, (_, index) => {
        const pose = poseAt(path, start + ((end - start) * index) / SAMPLES);
        const share = pose === null ? { x: 0, y: 0 } : viewShareOf(pose.position, stage);
        return { key: String(index), x: share.x, y: share.y };
      });
      const keys = path.keyframes
        .filter(
          (keyframe) =>
            keyframe.seconds >= start - EDGE_SECONDS && keyframe.seconds <= end + EDGE_SECONDS,
        )
        .map((keyframe, index) => {
          const share = viewShareOf(keyframe.position, stage);
          return { key: `${index}-${keyframe.seconds}`, x: share.x, y: share.y };
        });

      return { key: String(path.spotId), route, keys };
    });
};

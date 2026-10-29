import { partOfStep } from '@/features/act-player/music-timeline';
import { isPlayableVideo } from '@/features/act-player/video-sync';
import type { StudioPart, StudioStep, StudioVideo } from '@/features/acts/schemas';

const overlapOf = (video: StudioVideo, step: StudioStep): number => {
  if (
    video.startSeconds === null ||
    video.durationSeconds === null ||
    step.startSeconds === null ||
    step.endSeconds === null
  ) {
    return 0;
  }

  const start = Math.max(video.startSeconds, step.startSeconds);
  const end = Math.min(video.startSeconds + video.durationSeconds, step.endSeconds);

  return Math.max(0, end - start);
};

export const stepVideoOf = (
  videos: readonly StudioVideo[],
  parts: readonly StudioPart[],
  step: StudioStep | null,
): StudioVideo | null => {
  if (step === null) {
    return null;
  }

  const covering = videos.filter((video) => isPlayableVideo(video) && overlapOf(video, step) > 0);
  const mainId = partOfStep(parts, step.stepId)?.mainVideoId ?? null;
  const main = covering.find((video) => video.videoId === mainId);

  if (main !== undefined) {
    return main;
  }

  return covering.reduce<StudioVideo | null>(
    (best, video) =>
      best === null || overlapOf(video, step) > overlapOf(best, step) ? video : best,
    null,
  );
};

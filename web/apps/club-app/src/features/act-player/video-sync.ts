import type { StudioPart, StudioStep, StudioVideo } from '@/features/acts/schemas';
import { partOfStep, stepAt } from './music-timeline';

const SEEK_THRESHOLD_SECONDS = 0.3;
const HOLD_THRESHOLD_SECONDS = 0.04;
const NUDGE_SHARE = 0.5;
const MAX_NUDGE = 0.08;

export type VideoCorrection =
  | { kind: 'seek'; seconds: number }
  | { kind: 'nudge'; playbackRate: number };

export const isPlayableVideo = (video: StudioVideo): boolean =>
  video.state === 'ready' &&
  !video.outdated &&
  video.placement === 'onTimeline' &&
  video.startSeconds !== null &&
  video.durationSeconds !== null;

export const videoSecondsAt = (video: StudioVideo, seconds: number): number | null => {
  if (!isPlayableVideo(video) || video.startSeconds === null || video.durationSeconds === null) {
    return null;
  }

  const inVideo = seconds - video.startSeconds;

  return inVideo >= 0 && inVideo < video.durationSeconds ? inVideo : null;
};

const coversMoment = (video: StudioVideo, seconds: number): boolean =>
  videoSecondsAt(video, seconds) !== null;

export const videoAt = (
  videos: readonly StudioVideo[],
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
  seconds: number,
): StudioVideo | null => {
  const step = stepAt(steps, seconds);
  const part = step === null ? null : partOfStep(parts, step.stepId);
  const main = videos.find((video) => video.videoId === part?.mainVideoId);

  if (main !== undefined && coversMoment(main, seconds)) {
    return main;
  }

  return videos.find((video) => coversMoment(video, seconds)) ?? null;
};

export const videoCorrectionOf = (
  actualSeconds: number,
  targetSeconds: number,
  playbackRate: number,
): VideoCorrection => {
  const drift = targetSeconds - actualSeconds;

  if (Math.abs(drift) > SEEK_THRESHOLD_SECONDS) {
    return { kind: 'seek', seconds: targetSeconds };
  }

  if (Math.abs(drift) < HOLD_THRESHOLD_SECONDS) {
    return { kind: 'nudge', playbackRate };
  }

  const nudge = Math.max(-MAX_NUDGE, Math.min(MAX_NUDGE, drift * NUDGE_SHARE));

  return { kind: 'nudge', playbackRate: playbackRate * (1 + nudge) };
};

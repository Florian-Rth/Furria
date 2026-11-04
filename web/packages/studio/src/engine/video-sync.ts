import type { StudioVideo } from '../models/studio-schemas';

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
  video.durationSeconds !== null &&
  video.clipEndSeconds !== null;

export const videoSecondsAt = (video: StudioVideo, seconds: number): number | null => {
  if (!isPlayableVideo(video) || video.startSeconds === null || video.clipEndSeconds === null) {
    return null;
  }

  const inVideo = seconds - video.startSeconds;

  return inVideo >= video.clipStartSeconds && inVideo < video.clipEndSeconds ? inVideo : null;
};

export const videoStillAt = (video: StudioVideo, seconds: number): number | null => {
  if (!isPlayableVideo(video) || video.startSeconds === null || video.clipEndSeconds === null) {
    return null;
  }

  const inVideo = seconds - video.startSeconds;

  return Math.min(video.clipEndSeconds, Math.max(video.clipStartSeconds, inVideo));
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

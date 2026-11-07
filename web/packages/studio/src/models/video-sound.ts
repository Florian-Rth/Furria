import type { MusicSegment, TimelineRange } from './music-timeline';
import type { CutSpan } from './studio-cuts';
import type { StudioVideo } from './studio-schemas';
import { clampedVideoStartOf, clipOf } from './studio-videos';

export const soundClipOf = (video: StudioVideo): CutSpan | null =>
  clipOf(video) ??
  (video.durationSeconds === null ? null : { startSeconds: 0, endSeconds: video.durationSeconds });

export const soundSpanOf = (clip: CutSpan, videoStart: number): TimelineRange => ({
  start: videoStart + clip.startSeconds,
  end: videoStart + clip.endSeconds,
});

export const soundSegmentOf = (
  video: StudioVideo,
  clip: CutSpan,
  videoStart: number,
): MusicSegment => {
  const span = soundSpanOf(clip, videoStart);

  return {
    mediaItemId: video.mediaItemId,
    audioUrl: video.urls.video,
    peaksUrl: video.urls.peaks,
    audible: true,
    sourceStart: clip.startSeconds,
    sourceEnd: clip.endSeconds,
    timelineStart: span.start,
    timelineEnd: span.end,
    beats: [],
  };
};

export const videoStartOfDrag = (spanStart: number, clip: CutSpan, length: number): number =>
  clampedVideoStartOf(spanStart - clip.startSeconds, clip, length);

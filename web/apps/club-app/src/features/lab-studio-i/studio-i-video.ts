import { isPlayableVideo } from '@/features/act-player/video-sync';
import type { StudioPart, StudioVideo } from '@/features/acts/schemas';
import type { StepSpan } from './studio-i-spans';

export type ClipRole = 'main' | 'alternative';
export type ClipCover = 'whole' | 'partly';

export interface StepClip {
  video: StudioVideo;
  role: ClipRole;
  cover: ClipCover;
}

const rangeOf = (video: StudioVideo): { start: number; end: number } | null =>
  video.startSeconds === null || video.durationSeconds === null
    ? null
    : { start: video.startSeconds, end: video.startSeconds + video.durationSeconds };

export const shiftedVideoOf = (video: StudioVideo, shift: number): StudioVideo =>
  video.startSeconds === null || shift === 0
    ? video
    : { ...video, startSeconds: video.startSeconds + shift };

export const stepClipsOf = (
  videos: readonly StudioVideo[],
  part: StudioPart | null,
  span: StepSpan,
): StepClip[] =>
  videos
    .flatMap((video) => {
      const range = rangeOf(video);

      if (!isPlayableVideo(video) || range === null) {
        return [];
      }
      if (range.end <= span.start || range.start >= span.end) {
        return [];
      }

      const role: ClipRole = part?.mainVideoId === video.videoId ? 'main' : 'alternative';
      const cover: ClipCover =
        range.start <= span.start && range.end >= span.end ? 'whole' : 'partly';

      return [{ video, role, cover }];
    })
    .sort((left, right) => Number(right.role === 'main') - Number(left.role === 'main'));

export const nudgedShiftOf = (shift: number, direction: -1 | 1, frameSeconds: number): number =>
  Math.round((shift + direction * frameSeconds) * 1000) / 1000;

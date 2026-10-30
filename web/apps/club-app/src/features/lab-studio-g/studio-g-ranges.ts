import type { MusicSegment, TimelineRange } from '@/features/act-player/music-timeline';
import { partRangeOf, stepRangeOf } from '@/features/act-player/music-timeline';
import type { StudioPart, StudioStep, StudioVideo } from '@/features/acts/schemas';
import type { StudioGSelection } from './studio-g-selection';

export interface RangeSources {
  segments: readonly MusicSegment[];
  steps: readonly StudioStep[];
  parts: readonly StudioPart[];
  videos: readonly StudioVideo[];
}

const videoRangeOf = (video: StudioVideo | undefined): TimelineRange | null =>
  video === undefined || video.startSeconds === null || video.durationSeconds === null
    ? null
    : { start: video.startSeconds, end: video.startSeconds + video.durationSeconds };

export const selectionRangeOf = (
  selection: StudioGSelection,
  sources: RangeSources,
): TimelineRange | null => {
  switch (selection.kind) {
    case 'song': {
      const segment = sources.segments.find(
        (candidate) => candidate.mediaItemId === selection.mediaItemId,
      );
      return segment === undefined
        ? null
        : { start: segment.timelineStart, end: segment.timelineEnd };
    }
    case 'part': {
      const part = sources.parts.find((candidate) => candidate.partId === selection.partId);
      return part === undefined ? null : partRangeOf(part, sources.steps);
    }
    case 'step': {
      const step = sources.steps.find((candidate) => candidate.stepId === selection.stepId);
      return step === undefined ? null : stepRangeOf(step);
    }
    case 'video':
      return videoRangeOf(sources.videos.find((video) => video.videoId === selection.videoId));
    default:
      return null;
  }
};

export const isSameRange = (left: TimelineRange | null, right: TimelineRange | null): boolean =>
  left !== null && right !== null && left.start === right.start && left.end === right.end;

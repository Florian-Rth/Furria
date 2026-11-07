import type { TimelineRange } from '@furria/studio/music-timeline';
import { partRangeOf } from '@furria/studio/music-timeline';
import type { CutSpan } from '@furria/studio/studio-cuts';
import type { Studio, StudioPart, StudioStep, StudioVideo } from '@furria/studio/studio-schemas';

const START_GRAIN_SECONDS = 0.05;

export interface VideoStartInput {
  videoId: number;
  startSeconds: number;
}

export interface VideoClipInput {
  videoId: number;
  startSeconds: number;
  endSeconds: number;
}

export interface VideoSplitInput {
  videoId: number;
  atSeconds: number;
}

export interface VideoNameInput {
  videoId: number;
  name: string | null;
}

export type VideoShelf = 'placed' | 'waiting' | 'unplaced' | 'failed';

export const videoNumberOf = (videos: readonly StudioVideo[], videoId: number): number =>
  videos.findIndex((video) => video.videoId === videoId) + 1;

export const clipOf = (video: StudioVideo): CutSpan | null =>
  video.clipEndSeconds === null
    ? null
    : { startSeconds: video.clipStartSeconds, endSeconds: video.clipEndSeconds };

export const clipSpanOf = (video: StudioVideo): TimelineRange | null =>
  video.startSeconds === null || video.clipEndSeconds === null
    ? null
    : {
        start: video.startSeconds + video.clipStartSeconds,
        end: video.startSeconds + video.clipEndSeconds,
      };

export const clampedVideoStartOf = (start: number, clip: CutSpan, length: number): number => {
  const rounded = Number(
    (Math.round(start / START_GRAIN_SECONDS) * START_GRAIN_SECONDS).toFixed(2),
  );

  return Math.min(
    length - START_GRAIN_SECONDS - clip.startSeconds,
    Math.max(START_GRAIN_SECONDS - clip.endSeconds, rounded),
  );
};

export const videoShelfOf = (video: StudioVideo): VideoShelf => {
  if (video.state === 'failed') {
    return 'failed';
  }
  if (video.state === 'processing') {
    return 'waiting';
  }

  return video.placement === 'onTimeline' && video.startSeconds !== null ? 'placed' : 'unplaced';
};

export const needsAlignment = (video: StudioVideo): boolean =>
  video.state === 'ready' && video.placement === 'unaligned';

export const isDevelopingStudio = (studio: Studio): boolean =>
  [...studio.songs, ...studio.finalTracks, ...studio.videos].some(
    (item) => item.state === 'processing',
  );

export const musicKeyOf = (studio: Studio): string =>
  [...studio.songs, ...studio.finalTracks]
    .map((item) => `${item.mediaItemId}:${item.state}`)
    .join(',');

export const overlapsRange = (video: StudioVideo, range: TimelineRange): boolean => {
  const span = clipSpanOf(video);

  return span !== null && span.start < range.end && span.end > range.start;
};

export interface TakeGroup {
  part: StudioPart | null;
  range: TimelineRange | null;
  takes: StudioVideo[];
}

const mainFirst = (takes: readonly StudioVideo[], mainVideoId: number | null): StudioVideo[] => [
  ...takes.filter((take) => take.videoId === mainVideoId),
  ...takes.filter((take) => take.videoId !== mainVideoId),
];

export const takeGroupsOf = (
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
  placed: readonly StudioVideo[],
): TakeGroup[] => {
  const partGroups = parts.map((part) => {
    const range = partRangeOf(part, steps);
    const takes = placed.filter((take) => range !== null && overlapsRange(take, range));

    return { part, range, takes: mainFirst(takes, part.mainVideoId) };
  });
  const loose = placed.filter((take) => !partGroups.some((group) => group.takes.includes(take)));

  return loose.length === 0
    ? partGroups
    : [...partGroups, { part: null, range: null, takes: loose }];
};

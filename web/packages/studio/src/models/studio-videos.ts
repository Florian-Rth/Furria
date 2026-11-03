import type { TimelineRange } from '@furria/studio/music-timeline';
import { partRangeOf } from '@furria/studio/music-timeline';
import type { Studio, StudioPart, StudioStep, StudioVideo } from '@furria/studio/studio-schemas';

const START_GRAIN_SECONDS = 0.05;

export interface VideoStartInput {
  videoId: number;
  startSeconds: number;
}

export interface VideoNameInput {
  videoId: number;
  name: string | null;
}

export type VideoShelf = 'placed' | 'waiting' | 'unplaced' | 'failed';

export const clampedVideoStartOf = (start: number, duration: number, length: number): number => {
  const rounded = Number(
    (Math.round(start / START_GRAIN_SECONDS) * START_GRAIN_SECONDS).toFixed(2),
  );

  return Math.min(length - START_GRAIN_SECONDS, Math.max(START_GRAIN_SECONDS - duration, rounded));
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

export const overlapsRange = (video: StudioVideo, range: { start: number; end: number }): boolean =>
  video.startSeconds !== null &&
  video.durationSeconds !== null &&
  video.startSeconds < range.end &&
  video.startSeconds + video.durationSeconds > range.start;

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

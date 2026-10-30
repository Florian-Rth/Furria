import type { Studio, StudioVideo } from '@/features/acts/schemas';
import type { HoldsStudio } from './studio-music';
import { withStudio } from './studio-music';

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

export const withVideoStart = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  { videoId, startSeconds }: VideoStartInput,
): TResponse | undefined =>
  withStudio(response, (studio) => ({
    ...studio,
    videos: studio.videos.map((video) =>
      video.videoId === videoId ? { ...video, startSeconds, placement: 'onTimeline' } : video,
    ),
  }));

export const withVideoName = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  { videoId, name }: VideoNameInput,
): TResponse | undefined =>
  withStudio(response, (studio) => ({
    ...studio,
    videos: studio.videos.map((video) => (video.videoId === videoId ? { ...video, name } : video)),
  }));

export const withoutVideo = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  videoId: number,
): TResponse | undefined =>
  withStudio(response, (studio) => ({
    ...studio,
    videos: studio.videos.filter((video) => video.videoId !== videoId),
    parts: studio.parts.map((part) =>
      part.mainVideoId === videoId ? { ...part, mainVideoId: null } : part,
    ),
  }));

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

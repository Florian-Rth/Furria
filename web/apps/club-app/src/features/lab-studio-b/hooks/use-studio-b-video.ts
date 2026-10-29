import type { KkStudioBVideoSource } from '@furria/ui/KkStudioBVideo';
import type { RefObject } from 'react';
import { useRef } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import { useSlavedVideo } from '@/features/act-player/hooks/use-slaved-video';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { videoAt } from '@/features/act-player/video-sync';
import type { Studio, StudioVideo } from '@/features/acts/schemas';

export interface StudioBVideo {
  source: KkStudioBVideoSource | null;
  ref: RefObject<HTMLVideoElement | null>;
}

const sourceOf = (video: StudioVideo | null, fallbackName: string): KkStudioBVideoSource | null =>
  video === null
    ? null
    : { src: video.urls.video, poster: video.urls.poster, name: video.name ?? fallbackName };

export const useStudioBVideo = (
  playback: StudioPlayback,
  studio: Studio,
  fallbackName: string,
): StudioBVideo => {
  const ref = useRef<HTMLVideoElement | null>(null);
  const videoId = usePlaybackSelection(
    playback.player,
    (seconds) => videoAt(studio.videos, playback.parts, playback.steps, seconds)?.videoId ?? null,
  );
  const video = studio.videos.find((candidate) => candidate.videoId === videoId) ?? null;

  useSlavedVideo(playback.player, video, ref);

  return { source: sourceOf(video, fallbackName), ref };
};

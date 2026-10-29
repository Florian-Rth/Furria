import type { KkStudioAVideoSource } from '@furria/ui/KkStudioAVideo';
import { useIsMobile } from '@furria/ui/use-is-mobile';
import type { RefObject } from 'react';
import { useRef } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import { useSlavedVideo } from '@/features/act-player/hooks/use-slaved-video';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import { framedVideoOf } from '../studio-a-practice';

export interface StudioAVideo {
  ref: RefObject<HTMLVideoElement | null>;
  source: KkStudioAVideoSource | null;
  caption: string | null;
  shown: boolean;
}

export const useStudioAVideo = (studio: Studio, playback: StudioPlayback): StudioAVideo => {
  const { player, parts, steps } = playback;
  const ref = useRef<HTMLVideoElement>(null);
  const phone = useIsMobile();
  const videoId = usePlaybackSelection(
    player,
    (seconds) => framedVideoOf(studio.videos, parts, steps, seconds)?.videoId ?? null,
  );
  const video = studio.videos.find((candidate) => candidate.videoId === videoId) ?? null;
  const part = parts.find((candidate) => candidate.mainVideoId === videoId) ?? null;

  useSlavedVideo(player, video, ref);

  return {
    ref,
    source: video === null ? null : { video: video.urls.video, poster: video.urls.poster },
    caption: video === null ? null : (video.name ?? part?.name ?? null),
    shown: !phone || video !== null,
  };
};

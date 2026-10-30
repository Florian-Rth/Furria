import type { RefObject } from 'react';
import { useRef } from 'react';
import { useSlavedVideo } from '@/features/act-player/hooks/use-slaved-video';
import type { StudioH } from './use-studio-h';

export interface StudioHSideVideo {
  ref: RefObject<HTMLVideoElement | null>;
  filmed: boolean;
  active: boolean;
}

export const useStudioHSideVideo = (h: StudioH): StudioHSideVideo => {
  const { studio, video, playback, frame } = h;
  const ref = useRef<HTMLVideoElement>(null);
  const shown =
    studio.videos.find((candidate) => candidate.urls.video === video.source?.video) ?? null;
  const active = frame.side === 'cast';

  useSlavedVideo(playback.player, active ? shown : null, ref);

  return { ref, filmed: video.hero === 'video', active };
};

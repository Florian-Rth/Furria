import type { RefObject } from 'react';
import { useRef } from 'react';
import { useSlavedVideo } from '@/features/act-player/hooks/use-slaved-video';
import type { StudioScreen } from './use-studio-screen';

export interface ActStudioSideVideo {
  ref: RefObject<HTMLVideoElement | null>;
  filmed: boolean;
  active: boolean;
}

export const useActStudioSideVideo = (screen: StudioScreen): ActStudioSideVideo => {
  const { studio, video, playback, frame } = screen;
  const ref = useRef<HTMLVideoElement>(null);
  const shown = studio.videos.find((candidate) => candidate.videoId === video.shownId) ?? null;
  const active = frame.side === 'cast';

  useSlavedVideo(playback.player, active ? shown : null, ref);

  return { ref, filmed: video.hero === 'video', active };
};

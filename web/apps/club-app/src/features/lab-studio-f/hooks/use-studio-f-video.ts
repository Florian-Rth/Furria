import type { RefObject } from 'react';
import { useRef } from 'react';
import { useSlavedVideo } from '@/features/act-player/hooks/use-slaved-video';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StudioVideo } from '@/features/acts/schemas';

export const useStudioFVideo = (
  player: MixPlayer,
  video: StudioVideo,
): RefObject<HTMLVideoElement | null> => {
  const ref = useRef<HTMLVideoElement>(null);

  useSlavedVideo(player, video, ref);

  return ref;
};

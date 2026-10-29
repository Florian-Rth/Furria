import type { KkStudioEScreenVideoSource } from '@furria/ui/KkStudioEScreen';
import type { RefObject } from 'react';
import { useRef, useState } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import { useSlavedVideo } from '@/features/act-player/hooks/use-slaved-video';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import type { HeroKind } from '../studio-e-controls';
import { heroOf, partVideoOf } from '../studio-e-controls';

export interface StudioEVideo {
  ref: RefObject<HTMLVideoElement | null>;
  source: KkStudioEScreenVideoSource | null;
  hero: HeroKind;
  mirrored: boolean;
  toggleMirror: () => void;
}

export const useStudioEVideo = (studio: Studio, playback: StudioPlayback): StudioEVideo => {
  const { player, parts, steps } = playback;
  const ref = useRef<HTMLVideoElement>(null);
  const [mirrored, setMirrored] = useState(true);
  const videoId = usePlaybackSelection(
    player,
    (seconds) => partVideoOf(studio.videos, parts, steps, seconds)?.videoId ?? null,
  );
  const video = studio.videos.find((candidate) => candidate.videoId === videoId) ?? null;
  const [shown, setShown] = useState(video);

  if (video !== null && video !== shown) {
    setShown(video);
  }

  useSlavedVideo(player, video, ref);

  return {
    ref,
    source: shown === null ? null : { video: shown.urls.video, poster: shown.urls.poster },
    hero: heroOf(video),
    mirrored,
    toggleMirror: () => {
      setMirrored((flipped) => !flipped);
    },
  };
};

import type { KkStudioDPlayerVideoSource } from '@furria/ui/KkStudioDPlayer';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import { useSlavedVideo } from '@/features/act-player/hooks/use-slaved-video';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio, StudioVideo } from '@/features/acts/schemas';
import type { StudioDFraming } from '../studio-d-practice';
import { framingOf, heroVideoOf } from '../studio-d-practice';

export interface StudioDFrame {
  framing: StudioDFraming;
  source: KkStudioDPlayerVideoSource | null;
  fullRef: RefObject<HTMLVideoElement | null>;
  insetRef: RefObject<HTMLVideoElement | null>;
}

const useHeldVideo = (
  player: StudioPlayback['player'],
  video: StudioVideo | null,
  ref: RefObject<HTMLVideoElement | null>,
  active: boolean,
): void => {
  useSlavedVideo(player, active ? video : null, ref);

  useEffect(() => {
    if (!active) {
      ref.current?.pause();
    }
  }, [active, ref]);
};

export const useStudioDFrame = (
  studio: Studio,
  playback: StudioPlayback,
  stageFirst: boolean,
): StudioDFrame => {
  const { player, parts, steps } = playback;
  const fullRef = useRef<HTMLVideoElement>(null);
  const insetRef = useRef<HTMLVideoElement>(null);
  const videoId = usePlaybackSelection(
    player,
    (seconds) => heroVideoOf(studio.videos, parts, steps, seconds)?.videoId ?? null,
  );
  const video = studio.videos.find((candidate) => candidate.videoId === videoId) ?? null;
  const [held, setHeld] = useState<StudioVideo | null>(video);

  if (video !== null && video.videoId !== held?.videoId) {
    setHeld(video);
  }

  const framing = framingOf(video !== null, stageFirst);

  useHeldVideo(player, held, fullRef, !stageFirst);
  useHeldVideo(player, held, insetRef, stageFirst);

  return {
    framing,
    source: held === null ? null : { video: held.urls.video, poster: held.urls.poster },
    fullRef,
    insetRef,
  };
};

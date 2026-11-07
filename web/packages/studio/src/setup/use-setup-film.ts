import { videoSourceOf } from '@furria/studio/practice-controls';
import { useSlavedVideo } from '@furria/studio/use-slaved-video';
import type { StepSetup } from '@furria/studio/use-step-setup';
import type { KkVideoSource } from '@furria/ui/KkVideo';
import { useIsMobile } from '@furria/ui/use-is-mobile';
import type { RefObject } from 'react';
import { useRef } from 'react';

export interface SetupFilm {
  ref: RefObject<HTMLVideoElement | null>;
  source: KkVideoSource | null;
}

export const useSetupFilm = (setup: StepSetup): SetupFilm => {
  const { screen, video, facts } = setup;
  const ref = useRef<HTMLVideoElement>(null);
  const compact = useIsMobile();
  useSlavedVideo(screen.playback.player, facts.videoPlaced ? video : null, ref);

  return {
    ref,
    source: video === null || video.state !== 'ready' ? null : videoSourceOf(video, compact),
  };
};

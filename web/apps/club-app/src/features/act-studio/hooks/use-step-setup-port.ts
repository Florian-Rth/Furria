import type { StudioScreen } from '@furria/studio/studio-screen';
import type { StepSetupPort } from '@furria/studio/use-step-setup';
import { useState } from 'react';
import { useSoundPeaks } from '@/features/acts/api';

export const useStepSetupPort = (screen: StudioScreen, leave: () => void): StepSetupPort => {
  const [videoId, setVideoId] = useState<number | null>(null);
  const video = screen.studio.videos.find((candidate) => candidate.videoId === videoId) ?? null;
  const ready = video?.state === 'ready';
  const videoPeaks = useSoundPeaks(
    video === null || !ready
      ? null
      : { mediaItemId: video.mediaItemId, peaksUrl: video.urls.peaks },
  );

  return { videoId, chooseVideoId: setVideoId, videoPeaks, leave };
};

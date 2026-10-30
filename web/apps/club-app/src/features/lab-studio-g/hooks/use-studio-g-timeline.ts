import type { KkStudioGScrubPhase, KkStudioGTimelineGestures } from '@furria/ui/KkStudioGTimeline';
import { useRef, useState } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { clampedZoomOf, DEFAULT_PIXELS_PER_SECOND, scrubbedSecondsOf } from '../studio-g-timeline';

export interface StudioGTimeline {
  pixelsPerSecond: number;
  gestures: KkStudioGTimelineGestures;
}

export const useStudioGTimeline = (playback: StudioPlayback): StudioGTimeline => {
  const { player, length } = playback;
  const [pixelsPerSecond, setPixelsPerSecond] = useState(DEFAULT_PIXELS_PER_SECOND);
  const scrubFrom = useRef(0);

  const scrub = (phase: KkStudioGScrubPhase, deltaPx: number): void => {
    if (phase === 'start') {
      if (player.state().playing) {
        player.pause();
      }
      scrubFrom.current = player.position();
      return;
    }
    player.seek(scrubbedSecondsOf(scrubFrom.current, deltaPx, pixelsPerSecond, length));
  };

  return {
    pixelsPerSecond,
    gestures: {
      onScrub: scrub,
      onZoom: (factor) => {
        setPixelsPerSecond((current) => clampedZoomOf(current * factor));
      },
      onWheel: (deltaPx) => {
        player.seek(scrubbedSecondsOf(player.position(), -deltaPx, pixelsPerSecond, length));
      },
    },
  };
};

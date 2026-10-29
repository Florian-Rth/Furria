import type { RefObject } from 'react';
import { useEffect } from 'react';
import type { StudioVideo } from '@/features/acts/schemas';
import type { MixPlayer } from '../mix-player';
import { videoCorrectionOf, videoSecondsAt } from '../video-sync';

const PAUSED_TOLERANCE_SECONDS = 0.04;

const followOnce = (element: HTMLVideoElement, player: MixPlayer, video: StudioVideo): void => {
  if (element.seeking) {
    return;
  }

  const target = videoSecondsAt(video, player.position());
  const { playing, rate } = player.state();

  if (target === null || !playing) {
    if (!element.paused) {
      element.pause();
    }
    if (target !== null && Math.abs(element.currentTime - target) > PAUSED_TOLERANCE_SECONDS) {
      element.currentTime = target;
    }
    return;
  }

  const correction = videoCorrectionOf(element.currentTime, target, rate);

  if (correction.kind === 'seek') {
    element.currentTime = correction.seconds;
    element.playbackRate = rate;
  } else {
    element.playbackRate = correction.playbackRate;
  }

  if (element.paused) {
    void element.play().catch(() => undefined);
  }
};

export const useSlavedVideo = (
  player: MixPlayer,
  video: StudioVideo | null,
  elementRef: RefObject<HTMLVideoElement | null>,
): void => {
  useEffect(() => {
    if (video === null) {
      return;
    }

    let frame = 0;
    const follow = (): void => {
      const element = elementRef.current;
      if (element !== null) {
        followOnce(element, player, video);
      }
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);

    return () => {
      cancelAnimationFrame(frame);
      elementRef.current?.pause();
    };
  }, [player, video, elementRef]);
};

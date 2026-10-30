import type { RefObject } from 'react';
import { useEffect, useEffectEvent } from 'react';
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
  const following = video !== null;
  const follow = useEffectEvent((element: HTMLVideoElement): void => {
    if (video !== null) {
      followOnce(element, player, video);
    }
  });

  useEffect(() => {
    if (!following) {
      return;
    }

    let frame = 0;
    const tick = (): void => {
      const element = elementRef.current;
      if (element !== null) {
        follow(element);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      elementRef.current?.pause();
    };
  }, [following, elementRef]);
};

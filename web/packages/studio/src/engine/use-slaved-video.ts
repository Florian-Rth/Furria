import type { RefObject } from 'react';
import { useEffect, useEffectEvent } from 'react';
import type { StudioVideo } from '../models/studio-schemas';
import type { MixPlayer } from './mix-player';
import { videoCorrectionOf, videoSecondsAt, videoStillAt } from './video-sync';

const PAUSED_TOLERANCE_SECONDS = 0.04;

const followOnce = (element: HTMLVideoElement, player: MixPlayer, video: StudioVideo): void => {
  if (element.seeking) {
    return;
  }

  const position = player.position();
  const target = videoSecondsAt(video, position);
  const still = target ?? videoStillAt(video, position);
  const { playing, rate } = player.state();

  if (target === null || !playing || player.leadCount() !== null) {
    if (!element.paused) {
      element.pause();
    }
    if (still !== null && Math.abs(element.currentTime - still) > PAUSED_TOLERANCE_SECONDS) {
      element.currentTime = still;
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

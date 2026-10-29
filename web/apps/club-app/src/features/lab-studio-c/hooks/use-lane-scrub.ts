import type { PointerEvent } from 'react';
import { useRef } from 'react';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { scrubSecondsOf } from '../studio-c-timeline';

const DRAG_THRESHOLD_PIXELS = 6;

interface ScrubGrip {
  pointerId: number;
  startX: number;
  startSeconds: number;
  wasPlaying: boolean;
  dragging: boolean;
}

export interface LaneScrub {
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void;
}

export const useLaneScrub = (
  player: MixPlayer,
  pixelsPerSecond: number,
  length: number,
): LaneScrub => {
  const grip = useRef<ScrubGrip | null>(null);

  const release = (event: PointerEvent<HTMLDivElement>): void => {
    const held = grip.current;
    grip.current = null;

    if (held === null || held.pointerId !== event.pointerId || !held.dragging) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (held.wasPlaying) {
      player.play();
    }
  };

  return {
    onPointerDown: (event) => {
      if (event.button !== 0) {
        return;
      }

      grip.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startSeconds: player.position(),
        wasPlaying: player.state().playing,
        dragging: false,
      };
    },
    onPointerMove: (event) => {
      const held = grip.current;

      if (held === null || held.pointerId !== event.pointerId) {
        return;
      }

      const drag = event.clientX - held.startX;

      if (!held.dragging && Math.abs(drag) < DRAG_THRESHOLD_PIXELS) {
        return;
      }

      if (!held.dragging) {
        held.dragging = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        if (held.wasPlaying) {
          player.pause();
        }
      }

      player.seek(scrubSecondsOf(held.startSeconds, drag, pixelsPerSecond, length));
    },
    onPointerUp: release,
    onPointerCancel: release,
  };
};

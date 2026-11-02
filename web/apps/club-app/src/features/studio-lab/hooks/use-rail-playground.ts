import { formatReadoutTime } from '@furria/studio/drag-readout';
import type { GestureIntent } from '@furria/studio/gesture-recogniser';
import { momentumOf } from '@furria/studio/pan-bounds';
import { useGesture } from '@furria/studio/use-gesture';
import { usePanAxis } from '@furria/studio/use-pan-axis';
import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';
import type { KkTouchLabRailStepState } from '@furria/ui/KkTouchLab';
import type { AnimationPlaybackControls, MotionValue } from 'motion/react';
import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useEffectEvent, useRef } from 'react';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import type { RailItem } from '../rail-layout';
import {
  nearestRailOffset,
  railBoundsOf,
  railItemAt,
  railItemPlaying,
  railItemsOf,
  railOffsetOf,
} from '../rail-layout';
import type { StudioLabVariants } from '../schemas';
import type { LabArea, LabTransport } from './use-timeline-playground';

export interface RailStepView {
  stepId: number;
  left: number;
  width: number;
  name: string;
  detail: string;
  state: KkTouchLabRailStepState;
}

export interface RailPlayground {
  area: LabArea;
  x: MotionValue<number>;
  steps: readonly RailStepView[];
  transport: LabTransport;
}

const RAIL_POLICY = { drag: true, navigate: false, longPress: false, precision: 'none' } as const;
const FOLLOW_PAUSE_MS = 1800;
const SNAP_SPRING = { type: 'spring', stiffness: 380, damping: 40 } as const;

export const useRailPlayground = (studio: Studio, variants: StudioLabVariants): RailPlayground => {
  const playback = useStudioPlayback(studio, null);
  const seconds = usePlaybackSeconds(playback.player);
  const reducedMotion = useReducedMotion() ?? false;
  const items = railItemsOf(studio.steps);
  const settle = useRef<AnimationPlaybackControls | null>(null);
  const touched = useRef(0);
  const onIntent = (intent: GestureIntent): void => {
    handleIntent(intent);
  };
  const gesture = useGesture({ policy: RAIL_POLICY, onIntent });
  const width = gesture.areaSize?.width ?? 0;
  const bounds = railBoundsOf(items, width);
  const axis = usePanAxis({ bounds, dimension: width, initial: bounds.max });
  const playing = railItemPlaying(items, seconds);
  const loop = playback.state.loop;

  const stopSettle = (): void => {
    settle.current?.stop();
    settle.current = null;
  };

  const glideTo = (offset: number, velocity: number): void => {
    stopSettle();
    if (reducedMotion) {
      axis.jumpTo(offset);
      return;
    }
    settle.current = animate(axis.value, offset, {
      ...SNAP_SPRING,
      velocity,
      onComplete: () => {
        settle.current = null;
      },
    });
  };

  const release = (velocityPerMs: number): void => {
    if (variants.glide === 'free') {
      axis.release(velocityPerMs);
      return;
    }
    const projected = momentumOf(velocityPerMs, bounds);
    const travel = (projected.power ?? 1) * (projected.velocity ?? 0);
    glideTo(nearestRailOffset(items, width, axis.value.get() + travel), velocityPerMs * 1000);
  };

  const loopItem = (item: RailItem): void => {
    const step = studio.steps.find((candidate) => candidate.stepId === item.stepId);
    if (step !== undefined) {
      playback.controls.loopStep(step);
      playback.controls.seek(item.start);
    }
  };

  const handleIntent = (intent: GestureIntent): void => {
    switch (intent.kind) {
      case 'tap': {
        const item = railItemAt(items, intent.point.x - axis.value.get());
        if (item !== null) {
          loopItem(item);
          glideTo(railOffsetOf(item, width), 0);
        }
        return;
      }
      case 'dragStart':
        stopSettle();
        touched.current = performance.now();
        axis.grab();
        return;
      case 'drag':
        touched.current = performance.now();
        axis.follow(intent.delta.x);
        return;
      case 'dragEnd':
        touched.current = performance.now();
        release(intent.velocity.x);
        return;
      case 'dragCancel':
        release(0);
        return;
      default:
        return;
    }
  };

  const playingId = playing?.stepId ?? null;
  const measuredWidth = useRef(0);
  const follow = useEffectEvent((stepId: number | null, areaWidth: number): void => {
    const item = items.find((candidate) => candidate.stepId === stepId) ?? items[0];
    if (item === undefined || gesture.isActive() || areaWidth <= 0) {
      return;
    }
    const resized = measuredWidth.current !== areaWidth;
    measuredWidth.current = areaWidth;
    if (stepId === null || resized) {
      axis.jumpTo(railOffsetOf(item, areaWidth));
      return;
    }
    if (performance.now() - touched.current >= FOLLOW_PAUSE_MS) {
      glideTo(railOffsetOf(item, areaWidth), 0);
    }
  });
  useEffect(() => {
    follow(playingId, width);
  }, [playingId, width]);

  const stateOf = (item: RailItem): KkTouchLabRailStepState => {
    if (
      loop !== null &&
      Math.abs(loop.start - item.start) < 1e-3 &&
      Math.abs(loop.end - item.end) < 1e-3
    ) {
      return 'looped';
    }

    return item.stepId === playingId ? 'current' : 'idle';
  };

  return {
    area: {
      areaRef: gesture.areaRef,
      handlers: gesture.handlers,
      width,
      height: gesture.areaSize?.height ?? 0,
    },
    x: axis.value,
    steps: items.map((item) => ({
      stepId: item.stepId,
      left: item.left,
      width: item.width,
      name: item.name,
      detail: formatReadoutTime(item.start),
      state: stateOf(item),
    })),
    transport: {
      playing: playback.state.playing,
      time: formatReadoutTime(seconds),
      canUndo: false,
      toggle: playback.controls.toggle,
      undo: null,
      fit: null,
    },
  };
};

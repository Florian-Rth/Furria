import type { MotionValue } from 'motion/react';
import { animate, useMotionValue, useTransform } from 'motion/react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { useEffectEvent, useLayoutEffect, useRef } from 'react';
import type { StageIntent, StagePolicy } from '../internal/stage/stage-machine';
import { useImageStage } from '../internal/stage/use-image-stage';

const PULL_TRAVEL = 0.6;
const ENTER_SHIFT = 36;
const SLOTS: readonly string[] = ['1', '2', '3'];
const SHIFTED_SLOTS: Record<string, number> = { '!': 0, '"': 1, '§': 2, '@': 1, '#': 2 };
const OUTSIDE_GESTURE_SELECTOR = 'button, [role="alertdialog"]';

const LIGHT_TABLE_POLICY: Omit<StagePolicy, 'hasPrevious' | 'hasNext' | 'reducedMotion'> = {
  fit: 'contain',
  maxZoom: 1,
  doubleTapZoom: 1,
  swipe: true,
  pull: true,
};

export interface KkLightTableIntents {
  onStep: (delta: number) => void;
  onReject: (wholeScene: boolean) => void;
  onFile: (slot: number, wholeScene: boolean) => void;
  onUndo: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface KkLightTableStageHandlers {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
}

export interface KkLightTableArrival {
  opacity: MotionValue<number>;
  x: MotionValue<number>;
}

export interface KkLightTableStage {
  stageRef: (node: HTMLElement | null) => void;
  handlers: KkLightTableStageHandlers;
  track: MotionValue<number>;
  pullY: MotionValue<number>;
  arrival: KkLightTableArrival;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

interface UseLightTableStageOptions {
  frameId: string | null;
  previousId: string | null;
  nextId: string | null;
  reducedMotion: boolean;
  enterSeconds: number;
  intents: KkLightTableIntents;
}

const slotOf = (key: string): number | null => {
  const plain = SLOTS.indexOf(key);
  if (plain >= 0) {
    return plain;
  }
  return SHIFTED_SLOTS[key] ?? null;
};

const SIMPLE_KEYS: Record<string, (intents: KkLightTableIntents, shift: boolean) => void> = {
  ArrowRight: (intents) => intents.onStep(1),
  ArrowLeft: (intents) => intents.onStep(-1),
  j: (intents) => intents.onStep(1),
  k: (intents) => intents.onStep(-1),
  x: (intents, shift) => intents.onReject(shift),
  X: (intents) => intents.onReject(true),
  z: (intents) => intents.onUndo(),
  Enter: (intents) => intents.onConfirm(),
  Escape: (intents) => intents.onCancel(),
};

const isOutsideGesture = (target: EventTarget): boolean =>
  target instanceof Element && target.closest(OUTSIDE_GESTURE_SELECTOR) !== null;

export const useLightTableStage = ({
  frameId,
  previousId,
  nextId,
  reducedMotion,
  enterSeconds,
  intents,
}: UseLightTableStageOptions): KkLightTableStage => {
  const swipedTo = useRef<string | null>(null);
  const opacity = useMotionValue(1);
  const x = useMotionValue(0);

  const onIntent = (intent: StageIntent): void => {
    if (intent.kind === 'step') {
      swipedTo.current = intent.delta > 0 ? nextId : previousId;
      intents.onStep(intent.delta);
    } else if (intent.kind === 'pull') {
      intents.onReject(false);
    }
  };

  const stage = useImageStage({
    policy: {
      ...LIGHT_TABLE_POLICY,
      hasPrevious: previousId !== null,
      hasNext: nextId !== null,
      reducedMotion,
    },
    onIntent,
  });
  const pullY = useTransform(stage.pull, (pull) => pull * PULL_TRAVEL);
  const settle = useEffectEvent((settledId: string): void => {
    stage.dispatch({ type: 'reset' });
    const swiped = swipedTo.current === settledId;
    swipedTo.current = null;
    if (swiped) {
      opacity.jump(1);
      x.jump(0);
      return;
    }
    const enter = { duration: enterSeconds, ease: 'easeOut' } as const;
    opacity.jump(0);
    x.jump(reducedMotion ? 0 : ENTER_SHIFT);
    void animate(opacity, 1, enter);
    void animate(x, 0, enter);
  });

  useLayoutEffect(() => {
    if (frameId !== null) {
      settle(frameId);
    }
  }, [frameId]);

  const onPointerDown = (event: PointerEvent<HTMLElement>): void => {
    if (!isOutsideGesture(event.target)) {
      stage.handlers.onPointerDown(event);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    const simple = SIMPLE_KEYS[event.key];
    if (simple !== undefined) {
      event.preventDefault();
      simple(intents, event.shiftKey);
      return;
    }
    const slot = slotOf(event.key);
    if (slot !== null) {
      event.preventDefault();
      intents.onFile(slot, event.shiftKey);
    }
  };

  return {
    stageRef: stage.stageRef,
    handlers: {
      onPointerDown,
      onPointerMove: stage.handlers.onPointerMove,
      onPointerUp: stage.handlers.onPointerUp,
      onPointerCancel: stage.handlers.onPointerCancel,
    },
    track: stage.track,
    pullY,
    arrival: { opacity, x },
    onKeyDown,
  };
};

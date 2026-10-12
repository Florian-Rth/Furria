import type { MotionValue } from 'motion/react';
import { animate, useMotionValue } from 'motion/react';
import type { KeyboardEvent, PointerEvent, SyntheticEvent } from 'react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { KkCrop } from '../../image-crop';
import { kkMotion } from '../../kk-motion';
import type {
  StageInput,
  StageIntent,
  StagePointerInput,
  StagePolicy,
  StageState,
  StageView,
} from './stage-machine';
import {
  cropOfStage,
  imageBoxOf,
  initialStage,
  keyInputOf,
  stepStage,
  viewOf,
} from './stage-machine';

export interface ImageStageBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ImageStageMotion {
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
}

export interface ImageStageHandlers {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface ImageStage {
  stageRef: (node: HTMLElement | null) => void;
  handlers: ImageStageHandlers;
  onImageLoad: (event: SyntheticEvent<HTMLImageElement>) => void;
  imageBox: ImageStageBox | null;
  image: ImageStageMotion;
  track: MotionValue<number>;
  pull: MotionValue<number>;
  dispatch: (input: StageInput) => void;
  crop: () => KkCrop | null;
}

interface UseImageStageOptions {
  policy: StagePolicy;
  anchor?: KkCrop | null;
  onIntent: (intent: StageIntent) => void;
}

const isSameBox = (first: ImageStageBox | null, second: ImageStageBox | null): boolean =>
  first === second ||
  (first !== null &&
    second !== null &&
    first.left === second.left &&
    first.top === second.top &&
    first.width === second.width &&
    first.height === second.height);

const scaleOf = (event: Event): number | null =>
  'scale' in event && typeof event.scale === 'number' ? event.scale : null;

const pointOf = (event: Event): { clientX: number; clientY: number } | null =>
  event instanceof UIEvent &&
  'clientX' in event &&
  'clientY' in event &&
  typeof event.clientX === 'number' &&
  typeof event.clientY === 'number'
    ? { clientX: event.clientX, clientY: event.clientY }
    : null;

const glide = (value: MotionValue<number>, target: number): Promise<void> =>
  animate(value, target, kkMotion.layoutGlide).then(() => undefined);

const slide = (value: MotionValue<number>, target: number): Promise<void> =>
  animate(value, target, kkMotion.arrive).then(() => undefined);

export const useImageStage = ({
  policy,
  anchor = null,
  onIntent,
}: UseImageStageOptions): ImageStage => {
  const machine = useRef<StageState>(initialStage(anchor));
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [imageBox, setImageBox] = useState<ImageStageBox | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const track = useMotionValue(0);
  const pull = useMotionValue(0);
  const gestureScale = useRef(1);

  const show = (view: StageView): Promise<void> => {
    if (view.motion === 'follow' || view.motion === 'instant') {
      x.jump(view.image.x);
      y.jump(view.image.y);
      scale.jump(view.image.zoom);
      track.jump(view.track);
      pull.jump(view.pull);
      return Promise.resolve();
    }
    void glide(x, view.image.x);
    void glide(y, view.image.y);
    void glide(scale, view.image.zoom);
    void glide(pull, view.pull);

    return view.motion === 'slide' ? slide(track, view.track) : glide(track, view.track);
  };

  const dispatch = (input: StageInput): void => {
    const step = stepStage(machine.current, input, policy);
    machine.current = step.state;
    const view = viewOf(step.state);
    const shown = show(view);
    const box = imageBoxOf(step.state, policy);
    setImageBox((current) => (isSameBox(current, box) ? current : box));
    const steps = step.intents.filter((intent) => intent.kind === 'step');
    const others = step.intents.filter((intent) => intent.kind !== 'step');
    others.forEach(onIntent);
    if (view.motion === 'slide') {
      void shown.then(() => steps.forEach(onIntent));
    } else {
      steps.forEach(onIntent);
    }
  };

  const localOf = (clientX: number, clientY: number): { x: number; y: number } => {
    const rect = node?.getBoundingClientRect();

    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) };
  };

  const pointerInput = (
    type: 'pointerDown' | 'pointerMove' | 'pointerUp' | 'pointerCancel',
    event: PointerEvent<HTMLElement>,
  ): StagePointerInput => ({
    type,
    id: event.pointerId,
    ...localOf(event.clientX, event.clientY),
    t: event.timeStamp,
  });

  const onPointerDown = (event: PointerEvent<HTMLElement>): void => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatch({
      ...pointerInput('pointerDown', event),
      shown: { x: x.get(), y: y.get(), zoom: scale.get() },
    });
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>): void => {
    dispatch(pointerInput('pointerMove', event));
  };

  const onPointerUp = (event: PointerEvent<HTMLElement>): void => {
    dispatch(pointerInput('pointerUp', event));
  };

  const onPointerCancel = (event: PointerEvent<HTMLElement>): void => {
    dispatch(pointerInput('pointerCancel', event));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const input = keyInputOf(event.key, machine.current, policy);
    if (input === null || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    event.preventDefault();
    dispatch(input);
  };

  const onImageLoad = (event: SyntheticEvent<HTMLImageElement>): void => {
    dispatch({
      type: 'measure',
      image: {
        width: event.currentTarget.naturalWidth,
        height: event.currentTarget.naturalHeight,
      },
    });
  };

  const onResize = useEffectEvent((width: number, height: number): void => {
    dispatch({ type: 'measure', stage: { width, height } });
  });

  const onWheel = useEffectEvent((event: WheelEvent): void => {
    event.preventDefault();
    dispatch({
      type: 'wheel',
      dx: event.deltaX,
      dy: event.deltaY,
      ...localOf(event.clientX, event.clientY),
      pinch: event.ctrlKey,
      t: event.timeStamp,
    });
  });

  const onGestureStart = useEffectEvent((event: Event): void => {
    event.preventDefault();
    gestureScale.current = scaleOf(event) ?? 1;
  });

  const onGestureChange = useEffectEvent((event: Event): void => {
    event.preventDefault();
    const next = scaleOf(event);
    const point = pointOf(event);
    if (next === null || point === null || gestureScale.current <= 0) {
      return;
    }
    const ratio = next / gestureScale.current;
    gestureScale.current = next;
    dispatch({
      type: 'pinchGesture',
      scale: ratio,
      ...localOf(point.clientX, point.clientY),
      t: event.timeStamp,
    });
  });

  useEffect(() => {
    if (node === null) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry !== undefined) {
        onResize(entry.contentRect.width, entry.contentRect.height);
      }
    });
    const wheel = (event: WheelEvent): void => onWheel(event);
    const gestureStart = (event: Event): void => onGestureStart(event);
    const gestureChange = (event: Event): void => onGestureChange(event);
    observer.observe(node);
    node.addEventListener('wheel', wheel, { passive: false });
    node.addEventListener('gesturestart', gestureStart);
    node.addEventListener('gesturechange', gestureChange);

    return () => {
      observer.disconnect();
      node.removeEventListener('wheel', wheel);
      node.removeEventListener('gesturestart', gestureStart);
      node.removeEventListener('gesturechange', gestureChange);
    };
  }, [node]);

  return {
    stageRef: setNode,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onKeyDown },
    onImageLoad,
    imageBox,
    image: { x, y, scale },
    track,
    pull,
    dispatch,
    crop: () => cropOfStage(machine.current, policy),
  };
};

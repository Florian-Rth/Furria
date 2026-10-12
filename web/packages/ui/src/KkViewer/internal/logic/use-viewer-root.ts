import type { MotionValue } from 'motion/react';
import { animate, useMotionValue, useTransform } from 'motion/react';
import type { KeyboardEvent, PointerEvent, SyntheticEvent } from 'react';
import { useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import type { KkSize } from '../../../image-aspect';
import type { KkImageSource } from '../../../image-source';
import type { StageIntent, StagePolicy } from '../../../internal/stage/stage-machine';
import { useImageStage } from '../../../internal/stage/use-image-stage';
import { usePreloadImages } from '../../../internal/use-preload-images';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { kkMotion } from '../../../kk-motion';
import { neighboursOf, preloadPlanOf, steppedIndexOf } from '../../viewer-steps';
import type {
  KkViewerItem,
  KkViewerKeys,
  KkViewerLabels,
  KkViewerStepDelta,
} from '../../viewer-types';
import type { ViewerSlide, ViewerState } from './viewer-context';
import { isOnViewerControl } from './viewer-control';

type ViewerArrivalKind = 'swipe' | 'calm';

interface ViewerArrivalMark {
  index: number;
  kind: ViewerArrivalKind;
}

const VIEWER_POLICY: Omit<StagePolicy, 'hasPrevious' | 'hasNext' | 'reducedMotion'> = {
  fit: 'contain',
  maxZoom: 4,
  doubleTapZoom: 2.5,
  swipe: true,
  pull: true,
};

const ARRIVAL_OPACITY: Record<ViewerArrivalKind, number> = { swipe: 1, calm: 0 };
const PULL_SPAN = 600;
const PULL_SHRINK = 0.15;
const PULL_FADE_SPAN = 400;

const ARROW_STEPS: Readonly<Record<string, KkViewerStepDelta>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
};

const isNonNull = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

const pullScaleOf = (pull: number): number => 1 - Math.min(pull / PULL_SPAN, 1) * PULL_SHRINK;

const pullFadeOf = (pull: number): number => 1 - Math.min(pull / PULL_FADE_SPAN, 1) * 0.5;

const arrivalOpacityOf = (
  arrival: ViewerArrivalMark | null,
  settledIndex: number,
  wasOpen: boolean,
  reducedMotion: boolean,
): number => {
  if (!wasOpen || reducedMotion) {
    return 1;
  }
  const kind = arrival !== null && arrival.index === settledIndex ? arrival.kind : 'calm';
  return ARRIVAL_OPACITY[kind];
};

const useShownIndex = (index: number | null): number | null => {
  const [shown, setShown] = useState(index);
  const [previous, setPrevious] = useState(index);

  if (index !== previous) {
    setPrevious(index);
    if (index !== null) {
      setShown(index);
    }
  }

  return shown;
};

interface UseViewerRootOptions {
  items: readonly KkViewerItem[];
  index: number | null;
  labels: KkViewerLabels;
  keys?: KkViewerKeys;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export interface ViewerRoot {
  state: ViewerState | null;
  backdrop: MotionValue<number>;
  reducedMotion: boolean;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export const useViewerRoot = ({
  items,
  index,
  labels,
  keys,
  onIndexChange,
  onClose,
}: UseViewerRootOptions): ViewerRoot => {
  const shownIndex = useShownIndex(index);
  const count = items.length;
  const reducedMotion = useReducedMotion();
  const [arrival, setArrival] = useState<ViewerArrivalMark | null>(null);
  const loadedSizes = useRef(new Map<string, KkSize>());
  const wasOpen = useRef(false);
  const opacity = useMotionValue(1);
  const hasPrevious = shownIndex !== null && steppedIndexOf(shownIndex, -1, count) !== null;
  const hasNext = shownIndex !== null && steppedIndexOf(shownIndex, 1, count) !== null;

  const go = (target: number | null, kind: ViewerArrivalKind): void => {
    if (target === null || target === shownIndex) {
      return;
    }
    setArrival({ index: target, kind });
    onIndexChange(target);
  };

  const stepBy = (delta: number, kind: ViewerArrivalKind): void => {
    go(shownIndex === null ? null : steppedIndexOf(shownIndex, delta, count), kind);
  };

  const onIntent = (intent: StageIntent): void => {
    if (intent.kind === 'step') {
      stepBy(intent.delta, 'swipe');
    } else if (intent.kind === 'pull') {
      onClose();
    }
  };

  const stage = useImageStage({
    policy: { ...VIEWER_POLICY, hasPrevious, hasNext, reducedMotion },
    onIntent,
  });
  const pullScale = useTransform(stage.pull, (pull) => (reducedMotion ? 1 : pullScaleOf(pull)));
  const backdrop = useTransform(stage.pull, pullFadeOf);

  const settle = useEffectEvent((settledIndex: number): void => {
    const item = items[settledIndex];
    stage.dispatch({ type: 'reset' });
    stage.dispatch({
      type: 'measure',
      image: item === undefined ? null : (item.size ?? loadedSizes.current.get(item.key) ?? null),
    });
    const from = arrivalOpacityOf(arrival, settledIndex, wasOpen.current, reducedMotion);
    wasOpen.current = true;
    opacity.jump(from);
    if (from < 1) {
      void animate(opacity, 1, kkMotion.arrive);
    }
  });

  useLayoutEffect(() => {
    if (index === null) {
      wasOpen.current = false;
    } else {
      settle(index);
    }
  }, [index]);

  const preloadSources: KkImageSource[] =
    shownIndex === null
      ? []
      : preloadPlanOf(shownIndex, count)
          .map((planned) => items[planned]?.image)
          .filter(isNonNull);
  usePreloadImages(preloadSources);

  const onImageLoad = (key: string, event: SyntheticEvent<HTMLImageElement>): void => {
    const size = {
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    };
    loadedSizes.current.set(key, size);
    const current = shownIndex === null ? undefined : items[shownIndex];
    if (current !== undefined && current.key === key && current.size === undefined) {
      stage.dispatch({ type: 'measure', image: size });
    }
  };

  const unlessOnControl =
    (handler: (event: PointerEvent<HTMLElement>) => void) =>
    (event: PointerEvent<HTMLElement>): void => {
      if (!isOnViewerControl(event.target)) {
        handler(event);
      }
    };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (
      event.repeat ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      isOnViewerControl(event.target)
    ) {
      return;
    }
    const appKey = keys?.[event.key];
    if (appKey !== undefined) {
      event.preventDefault();
      appKey();
      return;
    }
    stage.handlers.onKeyDown(event);
    const delta = ARROW_STEPS[event.key];
    if (event.defaultPrevented || delta === undefined) {
      return;
    }
    event.preventDefault();
    stepBy(delta, 'calm');
  };

  const item = shownIndex === null ? undefined : items[shownIndex];
  if (shownIndex === null || item === undefined) {
    return { state: null, backdrop, reducedMotion, onKeyDown };
  }

  const slides: ViewerSlide[] = neighboursOf(shownIndex, count)
    .map((neighbour) => {
      const slideItem = items[neighbour.index];
      return slideItem === undefined ? null : { ...neighbour, item: slideItem };
    })
    .filter(isNonNull);

  return {
    state: {
      items,
      index: shownIndex,
      item,
      labels,
      slides,
      stage,
      stageHandlers: {
        onPointerDown: unlessOnControl(stage.handlers.onPointerDown),
        onPointerMove: stage.handlers.onPointerMove,
        onPointerUp: stage.handlers.onPointerUp,
        onPointerCancel: stage.handlers.onPointerCancel,
      },
      arrival: { opacity, pullY: stage.pull, pullScale },
      hasPrevious,
      hasNext,
      step: (delta: KkViewerStepDelta): void => stepBy(delta, 'calm'),
      show: (shown: number): void => go(shown >= 0 && shown < count ? shown : null, 'calm'),
      close: onClose,
      onImageLoad,
    },
    backdrop,
    reducedMotion,
    onKeyDown,
  };
};

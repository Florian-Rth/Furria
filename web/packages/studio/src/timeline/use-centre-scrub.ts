import type { AnimationPlaybackControls, MotionValue } from 'motion/react';
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { MixPlayer } from '../engine/mix-player';
import type {
  GestureIntent,
  GesturePoint,
  GesturePolicy,
  GesturePrecisionTier,
} from '../gestures/gesture-recogniser';
import { pulseHaptic } from '../gestures/haptics';
import type { LiftSize } from '../gestures/lift-placement';
import { LIFT_GAP, liftPlacementOf } from '../gestures/lift-placement';
import { BOUNCE_BACK, clampToBounds, momentumOf, momentumTargetOf } from '../gestures/pan-bounds';
import type { DragReadout } from '../gestures/use-drag-lift';
import type { GestureHandlers } from '../gestures/use-gesture';
import { useGesture } from '../gestures/use-gesture';
import { usePanAxis } from '../gestures/use-pan-axis';
import type { CountMark } from '../models/music-timeline';
import type { StripWindow } from './centre-scrub';
import {
  centreBoundsOf,
  centreOffsetOf,
  centrePxPerSecondOf,
  centreScaleOf,
  centreSecondsOf,
  centreZoomLimitsOf,
  flickVelocityOf,
  secondsAtX,
  snapCandidatesOf,
  snapSecondsOf,
  stripChunkOf,
  stripOutrunOf,
  stripSharesOf,
  stripWindowOf,
} from './centre-scrub';
import type { CentreTarget, CentreTargetUse, LaneBand } from './centre-targets';
import { pickCentreTarget, targetHitsOf } from './centre-targets';
import type { TimelineWindow } from './timeline-geometry';

export interface CentreDragValue {
  seconds: number;
  tier: GesturePrecisionTier;
}

export interface CentreScrub {
  areaRef: (node: HTMLElement | SVGElement | null) => void;
  handlers: GestureHandlers;
  size: LiftSize | null;
  x: MotionValue<number>;
  scale: MotionValue<number>;
  contentWidth: number;
  visibleShare: number;
  strip: StripWindow;
  window: TimelineWindow;
  activeKey: string | null;
  snapSeconds: number | null;
  readout: DragReadout<CentreDragValue> | null;
  width: number;
  pxPerSecond: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  fitted: boolean;
  zoomBy: (direction: 1 | -1) => void;
  fit: () => void;
  frame: (start: number, end: number) => void;
  centreOn: (seconds: number) => void;
  steerTo: (seconds: number) => void;
  steerView: (start: number, end: number) => void;
  letGo: () => void;
}

interface UseCentreScrubOptions {
  player: MixPlayer;
  length: number;
  countMarks: readonly CountMark[];
  targets: readonly CentreTarget[];
  editsRebuildPlayer?: boolean;
  startFitted?: boolean;
  seek?: (seconds: number) => void;
  onTargetStart?: (key: string) => void;
  onTargetMove?: (key: string, seconds: number) => void;
  onTargetEnd?: (key: string, seconds: number) => void;
  onTargetCancel?: (key: string) => void;
  onTargetTap?: (key: string) => void;
}

type CentreDrag =
  | { kind: 'handle'; key: string; x: number; seconds: number; snaps: boolean }
  | { kind: 'scrub'; tier: GesturePrecisionTier }
  | { kind: 'navigate'; seconds: number };

interface Held {
  finger: GesturePoint;
  value: CentreDragValue;
}

const POLICY: GesturePolicy = { drag: true, navigate: true, longPress: true, precision: 'x' };
const TAP_GLIDE = { type: 'spring', stiffness: 320, damping: 38 } as const;
const READOUT_SIZE: LiftSize = { width: 200, height: 34 };
const READOUT_ROOM = Number.POSITIVE_INFINITY;
const WHEEL_COMMIT_MS = 160;
const REACH_STEP = 0.5;
const ZOOM_STEP = 1.6;
const ZOOM_EDGE = 1e-3;
const FITTED = 0;
const LANE = '[data-timeline-lane]';

const laneBandsOf = (area: HTMLElement | SVGElement | null): Map<string, LaneBand> => {
  const bands = new Map<string, LaneBand>();
  if (area === null) {
    return bands;
  }
  const top = area.getBoundingClientRect().top;
  for (const lane of area.querySelectorAll<HTMLElement>(LANE)) {
    const key = lane.dataset.timelineLane;
    const box = lane.getBoundingClientRect();
    if (key !== undefined) {
      bands.set(key, { top: box.top - top, height: box.height });
    }
  }

  return bands;
};

export const useCentreScrub = ({
  player,
  length,
  countMarks,
  targets,
  editsRebuildPlayer = false,
  startFitted = false,
  seek,
  onTargetStart,
  onTargetMove,
  onTargetEnd,
  onTargetCancel,
  onTargetTap,
}: UseCentreScrubOptions): CentreScrub => {
  const reducedMotion = useReducedMotion() ?? false;
  const [chosenPxPerSecond, setChosenPxPerSecond] = useState<number | null>(
    startFitted ? FITTED : null,
  );
  const [anchor, setAnchor] = useState(0);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [snapSeconds, setSnapSeconds] = useState<number | null>(null);
  const [held, setHeld] = useState<Held | null>(null);
  const [reach, setReach] = useState(1);
  const drag = useRef<CentreDrag | null>(null);
  const steering = useRef(false);
  const resume = useRef(false);
  const resumeOnSwap = useRef(false);
  const stopTap = useRef(false);
  const lastSnap = useRef<number | null>(null);
  const wheelCommit = useRef<ReturnType<typeof setTimeout> | null>(null);
  const glide = useRef<AnimationPlaybackControls | null>(null);
  const lastNow = useRef(0);
  const seenPlayer = useRef<MixPlayer | null>(null);
  const area = useRef<HTMLElement | SVGElement | null>(null);
  const scale = useMotionValue(1);

  const onIntent = (intent: GestureIntent): void => {
    handleIntent(intent);
  };
  const gesture = useGesture({ policy: POLICY, onIntent });
  const size = gesture.areaSize;
  const width = size?.width ?? 0;
  const height = size?.height ?? 0;
  const centre = width / 2;
  const limits = centreZoomLimitsOf(length, width);
  const pxPerSecond = centrePxPerSecondOf(chosenPxPerSecond, limits);
  const bounds = centreBoundsOf(length, pxPerSecond, centre);
  const contentWidth = length * pxPerSecond;
  const reachWidth = width / reach;
  const strip = stripWindowOf(
    stripChunkOf(anchor * pxPerSecond, reachWidth),
    reachWidth,
    contentWidth,
  );
  const axis = usePanAxis({ bounds, dimension: width, initial: centre });
  const x = axis.value;

  const seekPlayer = (seconds: number): void => {
    if (seek === undefined) {
      player.seek(seconds);
      return;
    }
    seek(seconds);
  };

  const nowOf = (): number => centreSecondsOf(x.get(), pxPerSecond * scale.get(), centre, length);
  const secondsAt = (pointX: number): number => secondsAtX(pointX, x.get(), pxPerSecond, length);

  useMotionValueEvent(x, 'change', () => {
    const now = nowOf();
    lastNow.current = now;
    if (stripOutrunOf(strip, now * pxPerSecond, reachWidth, contentWidth)) {
      setAnchor(now);
    }
  });

  useLayoutEffect(() => {
    let frame: number | null = null;
    scale.jump(1);
    if (seenPlayer.current !== null && seenPlayer.current !== player) {
      glide.current?.stop();
      glide.current = null;
      steering.current = false;
      resume.current = false;
      player.seek(lastNow.current);
      if (resumeOnSwap.current) {
        player.play();
      }
    }
    resumeOnSwap.current = false;
    seenPlayer.current = player;
    const tick = (): void => {
      if (!steering.current) {
        x.jump(centreOffsetOf(player.position(), pxPerSecond * scale.get(), centre));
      }
      frame = player.state().playing ? requestAnimationFrame(tick) : null;
    };
    const wake = (): void => {
      if (frame === null) {
        tick();
      }
    };
    const unsubscribe = player.subscribe(wake);
    wake();
    setAnchor(lastNow.current);

    return () => {
      unsubscribe();
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [player, pxPerSecond, centre, x, scale]);

  useEffect(
    () => () => {
      glide.current?.stop();
      if (wheelCommit.current !== null) {
        clearTimeout(wheelCommit.current);
      }
    },
    [],
  );

  useEffect(
    () => () => {
      const left = seenPlayer.current;
      if (left !== null && steering.current && resume.current) {
        left.seek(lastNow.current);
        left.play();
      }
    },
    [],
  );

  const takeOver = (): void => {
    glide.current?.stop();
    glide.current = null;
    if (!steering.current) {
      steering.current = true;
      resume.current = player.state().playing;
      if (resume.current) {
        player.pause();
      }
    }
  };

  const settle = (resumeHere: boolean = true): void => {
    if (!steering.current) {
      return;
    }
    glide.current = null;
    steering.current = false;
    seekPlayer(nowOf());
    if (resume.current) {
      resume.current = false;
      if (resumeHere) {
        player.play();
      } else {
        resumeOnSwap.current = true;
      }
    }
  };

  const glideDone = (): void => {
    settle();
  };

  const release = (velocityPerMs: number, tier: GesturePrecisionTier): void => {
    const resting = clampToBounds(x.get(), bounds);
    const flick = flickVelocityOf(velocityPerMs, tier);
    if (resting !== x.get() && !reducedMotion) {
      glide.current = animate(x, resting, { ...BOUNCE_BACK, onComplete: glideDone });
      return;
    }
    if (flick === 0 || reducedMotion) {
      axis.jumpTo(resting);
      settle();
      return;
    }
    const momentum = momentumOf(flick, bounds);
    glide.current = animate(x, momentumTargetOf(x.get(), momentum), {
      type: 'inertia',
      ...momentum,
      onComplete: glideDone,
    });
  };

  const glideTo = (seconds: number): void => {
    takeOver();
    const target = centreOffsetOf(seconds, pxPerSecond, centre);
    if (reducedMotion) {
      axis.jumpTo(target);
      settle();
      return;
    }
    glide.current = animate(x, target, { ...TAP_GLIDE, onComplete: glideDone });
  };

  const targetAt = (point: GesturePoint, use: CentreTargetUse): CentreTarget | null => {
    const hits = targetHitsOf(
      targets,
      x.get(),
      pxPerSecond,
      height,
      laneBandsOf(area.current),
      activeKey,
    );

    return pickCentreTarget(targets, hits, point, use);
  };

  const endEdit = (resumeHere: boolean = true): void => {
    drag.current = null;
    lastSnap.current = null;
    settle(resumeHere);
    setActiveKey(null);
    setSnapSeconds(null);
    setHeld(null);
  };

  const moveHandle = (
    current: Extract<CentreDrag, { kind: 'handle' }>,
    point: GesturePoint,
    deltaX: number,
    tier: GesturePrecisionTier,
  ): void => {
    const handleX = current.x + deltaX;
    const raw = secondsAt(handleX);
    const snap =
      tier === 'full' && current.snaps
        ? snapSecondsOf(raw, snapCandidatesOf(countMarks, pxPerSecond), pxPerSecond)
        : { seconds: raw, snapped: false };
    const snapped = snap.snapped ? snap.seconds : null;
    if (snapped !== null && snapped !== lastSnap.current) {
      pulseHaptic();
    }
    lastSnap.current = snapped;
    drag.current = { ...current, x: handleX, seconds: snap.seconds };
    setSnapSeconds(snapped);
    setHeld({ finger: point, value: { seconds: snap.seconds, tier } });
    onTargetMove?.(current.key, snap.seconds);
  };

  const navigate = (intent: Extract<GestureIntent, { kind: 'navigate' }>): void => {
    const current = drag.current;
    if (current !== null && current.kind !== 'navigate') {
      return;
    }
    const oneShot = current === null;
    if (oneShot) {
      takeOver();
    }
    const from = current?.seconds ?? nowOf();
    const zoom = centreScaleOf(pxPerSecond, scale.get() * intent.scale, limits);
    const shownPxPerSecond = pxPerSecond * zoom;
    const seconds = Math.min(Math.max(from - intent.dx / shownPxPerSecond, 0), length);
    scale.jump(zoom);
    x.jump(centreOffsetOf(seconds, shownPxPerSecond, centre));
    if (zoom < reach * REACH_STEP) {
      setReach(zoom);
    }
    if (oneShot) {
      commitWheel(seconds);
      return;
    }
    drag.current = { kind: 'navigate', seconds };
  };

  const commitZoom = (seconds: number): void => {
    settle();
    setReach(1);
    setAnchor(seconds);
    setChosenPxPerSecond(pxPerSecond * scale.get());
  };

  const commitWheel = (seconds: number): void => {
    if (wheelCommit.current !== null) {
      clearTimeout(wheelCommit.current);
    }
    wheelCommit.current = setTimeout(() => {
      wheelCommit.current = null;
      commitZoom(seconds);
    }, WHEEL_COMMIT_MS);
  };

  const endDrag = (kept: boolean, velocityPerMs: number = 0): void => {
    const current = drag.current;
    drag.current = null;
    if (current?.kind === 'handle') {
      if (kept) {
        onTargetEnd?.(current.key, current.seconds);
      } else {
        onTargetCancel?.(current.key);
      }
      endEdit(!kept || !editsRebuildPlayer);
      return;
    }
    if (current?.kind === 'scrub') {
      release(velocityPerMs, current.tier);
    }
  };

  const handleIntent = (intent: GestureIntent): void => {
    switch (intent.kind) {
      case 'press':
        if (glide.current !== null) {
          takeOver();
          axis.grab();
          stopTap.current = true;
        }
        return;
      case 'tap': {
        if (stopTap.current) {
          stopTap.current = false;
          settle();
          return;
        }
        const tapped = targetAt(intent.point, 'tap');
        if (tapped !== null && onTargetTap !== undefined) {
          onTargetTap(tapped.key);
          return;
        }
        glideTo(secondsAt(intent.point.x));
        return;
      }
      case 'pressCancel':
        stopTap.current = false;
        return;
      case 'longPress': {
        const handle = targetAt(intent.point, 'drag');
        if (handle !== null) {
          takeOver();
          pulseHaptic();
          setActiveKey(handle.key);
          setHeld({ finger: intent.point, value: { seconds: handle.seconds, tier: 'full' } });
        }
        return;
      }
      case 'holdEnd':
        endEdit();
        return;
      case 'dragStart': {
        const handle = targetAt(intent.origin, 'drag');
        stopTap.current = false;
        takeOver();
        if (handle === null) {
          axis.grab();
          drag.current = { kind: 'scrub', tier: 'full' };
          return;
        }
        drag.current = {
          kind: 'handle',
          key: handle.key,
          x: x.get() + handle.seconds * pxPerSecond,
          seconds: handle.seconds,
          snaps: handle.snaps ?? true,
        };
        setActiveKey(handle.key);
        onTargetStart?.(handle.key);
        return;
      }
      case 'drag': {
        const current = drag.current;
        if (current?.kind === 'handle') {
          moveHandle(current, intent.point, intent.delta.x, intent.precision);
          return;
        }
        if (current?.kind === 'scrub') {
          drag.current = { kind: 'scrub', tier: intent.precision };
          axis.follow(intent.delta.x);
        }
        return;
      }
      case 'dragEnd':
        endDrag(true, intent.velocity.x);
        return;
      case 'dragCancel':
        endDrag(false);
        return;
      case 'navigateStart':
        takeOver();
        drag.current = { kind: 'navigate', seconds: nowOf() };
        return;
      case 'navigate':
        navigate(intent);
        return;
      case 'navigateEnd': {
        const current = drag.current;
        drag.current = null;
        if (current?.kind !== 'navigate') {
          return;
        }
        commitZoom(current.seconds);
        return;
      }
      default:
        return;
    }
  };

  const attachArea = (node: HTMLElement | SVGElement | null): void => {
    area.current = node;
    gesture.areaRef(node);
  };

  const zoomTo = (wanted: number): void => {
    glide.current?.stop();
    settle();
    setReach(1);
    setAnchor(nowOf());
    setChosenPxPerSecond(Math.min(Math.max(wanted, limits.min), limits.max));
  };

  const centreOn = (seconds: number): void => {
    const target = Math.min(Math.max(seconds, 0), length);
    const resumeHere = steering.current && resume.current;
    glide.current?.stop();
    glide.current = null;
    steering.current = false;
    resume.current = false;
    axis.jumpTo(centreOffsetOf(target, pxPerSecond * scale.get(), centre));
    seekPlayer(target);
    if (resumeHere) {
      player.play();
    }
  };

  const steerTo = (seconds: number): void => {
    takeOver();
    const target = Math.min(Math.max(seconds, 0), length);
    x.jump(centreOffsetOf(target, pxPerSecond * scale.get(), centre));
  };

  const steerView = (start: number, end: number): void => {
    const span = end - start;
    if (span <= 0 || pxPerSecond <= 0) {
      return;
    }
    takeOver();
    const zoom = centreScaleOf(pxPerSecond, width / span / pxPerSecond, limits);
    const seconds = Math.min(Math.max((start + end) / 2, 0), length);
    scale.jump(zoom);
    x.jump(centreOffsetOf(seconds, pxPerSecond * zoom, centre));
    if (zoom < reach * REACH_STEP) {
      setReach(zoom);
    }
  };

  const letGo = (): void => {
    if (scale.get() !== 1) {
      commitZoom(nowOf());
      return;
    }
    settle();
  };

  const readout =
    held === null || size === null
      ? null
      : {
          value: held.value,
          placement: liftPlacementOf(held.finger, size, READOUT_SIZE, LIFT_GAP, READOUT_ROOM),
        };

  return {
    areaRef: attachArea,
    handlers: gesture.handlers,
    size,
    x,
    scale,
    contentWidth,
    visibleShare: contentWidth > 0 ? Math.min(1, width / contentWidth) : 1,
    strip,
    window: stripSharesOf(strip, contentWidth),
    activeKey,
    snapSeconds,
    readout,
    width,
    pxPerSecond,
    canZoomIn: pxPerSecond < limits.max * (1 - ZOOM_EDGE),
    canZoomOut: pxPerSecond > limits.min * (1 + ZOOM_EDGE),
    fitted: pxPerSecond <= limits.min * (1 + ZOOM_EDGE),
    zoomBy: (direction) => {
      zoomTo(pxPerSecond * ZOOM_STEP ** direction);
    },
    fit: () => {
      zoomTo(limits.min);
    },
    frame: (start, end) => {
      const span = Math.max(end - start, 0);
      if (span > 0) {
        zoomTo(width / span);
      }
      centreOn((start + end) / 2);
    },
    centreOn,
    steerTo,
    steerView,
    letGo,
  };
};

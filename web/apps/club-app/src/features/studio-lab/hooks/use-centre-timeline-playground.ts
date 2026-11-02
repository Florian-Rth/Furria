import { formatReadoutTime } from '@furria/studio/drag-readout';
import type { GestureIntent, GesturePoint } from '@furria/studio/gesture-recogniser';
import { pulseHaptic } from '@furria/studio/haptics';
import { pickHitTarget } from '@furria/studio/hit-priority';
import type { MixPlayer } from '@furria/studio/mix-player';
import { countAt, musicLengthOf, musicSegmentsOf } from '@furria/studio/music-timeline';
import { momentumOf, momentumTargetOf } from '@furria/studio/pan-bounds';
import { useGesture } from '@furria/studio/use-gesture';
import { usePanAxis } from '@furria/studio/use-pan-axis';
import type { AnimationPlaybackControls, MotionValue } from 'motion/react';
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import type { StripWindow } from '../centre-view';
import {
  centreBoundsOf,
  centreOffsetOf,
  centrePxPerSecondOf,
  centreScaleOf,
  centreSecondsOf,
  stripChunkOf,
  stripOutrunOf,
  stripViewOf,
  stripWindowOf,
} from '../centre-view';
import { labDragStepOf, labPolicyOf } from '../lab-drag';
import { labLiftOf } from '../lab-lift';
import type { StudioLabVariants } from '../schemas';
import { countDetailOf, precisionBadgeOf } from '../studio-lab-copy';
import type { TimelineEdge } from '../timeline-edits';
import { timelineEdgesOf, withEdgeAt } from '../timeline-edits';
import type { WaveBar } from '../timeline-layers';
import {
  BORDER_ZONE_SHARE,
  edgeTargetsOf,
  loudestPeakOf,
  snapCandidatesOf,
  ticksOf,
  waveBarsOf,
} from '../timeline-layers';
import type { TimelineView } from '../timeline-view';
import { secondsOfX, snapSecondsOf, xOfSeconds, zoomLimitsOf } from '../timeline-view';
import { useLabHistory } from './use-lab-history';
import type {
  LabArea,
  LabLiftView,
  LabTransport,
  TimelineBandView,
  TimelineHandleView,
} from './use-timeline-playground';
import { LOUPE, READOUT_WIDTH } from './use-timeline-playground';

export interface CentreStripView {
  x: MotionValue<number>;
  scale: MotionValue<number>;
  window: StripWindow;
}

export interface CentreLayersView {
  strip: CentreStripView;
  played: readonly WaveBar[];
  ahead: readonly WaveBar[];
  ticks: ReturnType<typeof ticksOf>;
  snapX: number | null;
  bands: readonly TimelineBandView[];
  handles: readonly TimelineHandleView[];
  centreX: number;
}

export interface CentreTimelinePlayground {
  area: LabArea;
  layers: CentreLayersView;
  lifted: LabLiftView | null;
  transport: LabTransport;
}

type CentreDrag =
  | { kind: 'edge'; edge: TimelineEdge; x: number }
  | { kind: 'scrub'; ratio: number }
  | { kind: 'navigate'; seconds: number };

interface LiftState {
  finger: GesturePoint;
  seconds: number;
  badge: string | null;
}

const TAP_GLIDE = { type: 'spring', stiffness: 320, damping: 38 } as const;

export const useCentreTimelinePlayground = (
  studio: Studio,
  variants: StudioLabVariants,
): CentreTimelinePlayground => {
  const history = useLabHistory(studio);
  const committed = history.value;
  const shown = history.shown;
  const playback = useStudioPlayback(committed, null);
  const player = playback.player;
  const committedSegments = musicSegmentsOf(committed);
  const segments = musicSegmentsOf(shown);
  const length = musicLengthOf(segments);
  const reducedMotion = useReducedMotion() ?? false;
  const [chosenPxPerSecond, setChosenPxPerSecond] = useState<number | null>(null);
  const [anchor, setAnchor] = useState(0);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [snapAt, setSnapAt] = useState<number | null>(null);
  const [lift, setLift] = useState<LiftState | null>(null);
  const lastSnap = useRef<number | null>(null);
  const drag = useRef<CentreDrag | null>(null);
  const steering = useRef(false);
  const resume = useRef(false);
  const glide = useRef<AnimationPlaybackControls | null>(null);
  const lastNow = useRef(0);
  const seenPlayer = useRef<MixPlayer | null>(null);
  const scale = useMotionValue(1);
  const time = useMotionValue(formatReadoutTime(0));
  const top = loudestPeakOf(playback.peaksByItem);

  const onIntent = (intent: GestureIntent): void => {
    handleIntent(intent);
  };
  const gesture = useGesture({ policy: labPolicyOf(variants.precision, 'x'), onIntent });
  const width = gesture.areaSize?.width ?? 0;
  const height = gesture.areaSize?.height ?? 0;
  const centre = width / 2;
  const limits = zoomLimitsOf(length, width);
  const pxPerSecond = centrePxPerSecondOf(chosenPxPerSecond, limits);
  const bounds = centreBoundsOf(length, pxPerSecond, centre);
  const contentWidth = length * pxPerSecond;
  const stripWindow = stripWindowOf(stripChunkOf(anchor * pxPerSecond, width), width, contentWidth);
  const axis = usePanAxis({
    bounds,
    dimension: width,
    initial: centre,
  });
  const x = axis.value;

  const nowOf = (): number => centreSecondsOf(x.get(), pxPerSecond * scale.get(), centre, length);
  const screenViewOf = (): TimelineView => ({ pxPerSecond, offsetPx: x.get() });

  useMotionValueEvent(x, 'change', () => {
    const now = nowOf();
    lastNow.current = now;
    time.set(formatReadoutTime(now));
    if (stripOutrunOf(stripWindow, now * pxPerSecond, width, contentWidth)) {
      setAnchor(now);
    }
  });

  useLayoutEffect(() => {
    let frame: number | null = null;
    scale.jump(1);
    if (seenPlayer.current !== null && seenPlayer.current !== player) {
      steering.current = false;
      resume.current = false;
      player.seek(lastNow.current);
    }
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

  useEffect(() => () => glide.current?.stop(), []);

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

  const settle = (): void => {
    if (!steering.current) {
      return;
    }
    glide.current = null;
    steering.current = false;
    player.seek(nowOf());
    if (resume.current) {
      resume.current = false;
      player.play();
    }
  };

  const release = (velocityPerMs: number): void => {
    if (reducedMotion) {
      axis.jumpTo(x.get());
      settle();
      return;
    }
    const momentum = momentumOf(velocityPerMs, bounds);
    glide.current = animate(x, momentumTargetOf(x.get(), momentum), {
      type: 'inertia',
      ...momentum,
      onComplete: settle,
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
    glide.current = animate(x, target, { ...TAP_GLIDE, onComplete: settle });
  };

  const edgeAt = (point: GesturePoint): TimelineEdge | null => {
    const edges = timelineEdgesOf(committed, committedSegments);
    const key = pickHitTarget(edgeTargetsOf(edges, screenViewOf(), height, activeKey), point);

    return edges.find((edge) => edge.key === key) ?? null;
  };

  const stepAt = (seconds: number): number | null =>
    shown.steps.find(
      (step) =>
        step.startSeconds !== null &&
        step.endSeconds !== null &&
        seconds >= step.startSeconds &&
        seconds < step.endSeconds,
    )?.stepId ?? null;

  const endEdit = (): void => {
    drag.current = null;
    settle();
    setActiveKey(null);
    lastSnap.current = null;
    setSnapAt(null);
    setLift(null);
  };

  const moveEdge = (
    current: Extract<CentreDrag, { kind: 'edge' }>,
    intent: GestureIntent,
  ): void => {
    if (intent.kind !== 'drag') {
      return;
    }
    const step = labDragStepOf(variants.precision, intent);
    const edgeX = current.x + step.delta.x;
    drag.current = { ...current, x: edgeX };
    const view = screenViewOf();
    const raw = Math.min(Math.max(secondsOfX(edgeX, view), 0), length);
    const snap =
      step.tier === 'full'
        ? snapSecondsOf(raw, snapCandidatesOf(playback.countMarks, view), view)
        : { seconds: raw, snapped: false };
    if (snap.snapped && snap.seconds !== lastSnap.current) {
      pulseHaptic();
    }
    lastSnap.current = snap.snapped ? snap.seconds : null;
    setSnapAt(lastSnap.current);
    setLift({ finger: intent.point, seconds: snap.seconds, badge: precisionBadgeOf(step.tier) });
    history.preview(withEdgeAt(committed, current.edge, snap.seconds, committedSegments));
  };

  const handleIntent = (intent: GestureIntent): void => {
    switch (intent.kind) {
      case 'tap': {
        const seconds = Math.min(Math.max(secondsOfX(intent.point.x, screenViewOf()), 0), length);
        if (intent.point.y < height * BORDER_ZONE_SHARE) {
          const stepId = stepAt(seconds);
          setSelectedStepId((current) => (current === stepId ? null : stepId));
        }
        glideTo(seconds);
        return;
      }
      case 'longPress': {
        const edge = edgeAt(intent.point);
        if (edge !== null) {
          takeOver();
          pulseHaptic();
          setActiveKey(edge.key);
          setLift({
            finger: intent.point,
            seconds: edge.seconds,
            badge: precisionBadgeOf(variants.precision === 'hold' ? 'quarter' : 'full'),
          });
        }
        return;
      }
      case 'holdEnd':
        endEdit();
        return;
      case 'dragStart': {
        const edge = edgeAt(intent.origin);
        if (edge === null) {
          takeOver();
          axis.grab();
          drag.current = { kind: 'scrub', ratio: 1 };
          return;
        }
        takeOver();
        drag.current = { kind: 'edge', edge, x: xOfSeconds(edge.seconds, screenViewOf()) };
        setActiveKey(edge.key);
        return;
      }
      case 'drag': {
        const current = drag.current;
        if (current?.kind === 'edge') {
          moveEdge(current, intent);
          return;
        }
        if (current?.kind === 'scrub') {
          const step = labDragStepOf(variants.precision, intent);
          drag.current = {
            kind: 'scrub',
            ratio: intent.delta.x === 0 ? current.ratio : step.delta.x / intent.delta.x,
          };
          axis.follow(step.delta.x);
        }
        return;
      }
      case 'dragEnd': {
        const current = drag.current;
        drag.current = null;
        if (current?.kind === 'edge') {
          history.keep();
          endEdit();
          return;
        }
        if (current?.kind === 'scrub') {
          release(intent.velocity.x * current.ratio);
        }
        return;
      }
      case 'dragCancel': {
        const current = drag.current;
        drag.current = null;
        if (current?.kind === 'edge') {
          history.drop();
          endEdit();
          return;
        }
        if (current?.kind === 'scrub') {
          release(0);
        }
        return;
      }
      case 'navigateStart':
        takeOver();
        drag.current = { kind: 'navigate', seconds: nowOf() };
        return;
      case 'navigate': {
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
        if (oneShot) {
          settle();
          setAnchor(seconds);
          setChosenPxPerSecond(shownPxPerSecond);
          return;
        }
        drag.current = { kind: 'navigate', seconds };
        return;
      }
      case 'navigateEnd': {
        const current = drag.current;
        drag.current = null;
        if (current?.kind !== 'navigate') {
          return;
        }
        settle();
        setAnchor(current.seconds);
        setChosenPxPerSecond(pxPerSecond * scale.get());
        return;
      }
      default:
        return;
    }
  };

  const stripView = stripViewOf(stripWindow, pxPerSecond);
  const bars = waveBarsOf(segments, playback.peaksByItem, stripView, stripWindow.width, -1, top);
  const bands = shown.steps.flatMap((step) => {
    if (step.startSeconds === null || step.endSeconds === null) {
      return [];
    }
    const start = xOfSeconds(step.startSeconds, stripView);
    const end = xOfSeconds(step.endSeconds, stripView);

    return end < 0 || start > stripWindow.width
      ? []
      : [
          {
            key: String(step.stepId),
            x: start,
            width: end - start,
            label: step.name,
            selected: step.stepId === selectedStepId,
          },
        ];
  });
  const handles = timelineEdgesOf(shown, segments)
    .map((edge) => ({
      key: edge.key,
      x: xOfSeconds(edge.seconds, stripView),
      kind: edge.kind,
      active: edge.key === activeKey,
    }))
    .filter((handle) => handle.x >= -2 && handle.x <= stripWindow.width + 2);
  const lifted =
    lift === null
      ? null
      : {
          finger: lift.finger,
          lift: labLiftOf(
            lift.finger,
            width,
            READOUT_WIDTH,
            variants.lift === 'loupe' ? LOUPE : null,
            Number.POSITIVE_INFINITY,
          ),
          readout: {
            value: formatReadoutTime(lift.seconds),
            detail: countDetailOf(countAt(segments, lift.seconds)),
            badge: lift.badge,
          },
        };

  return {
    area: { areaRef: gesture.areaRef, handlers: gesture.handlers, width, height },
    layers: {
      strip: { x, scale, window: stripWindow },
      played: bars.map((bar) => ({ ...bar, played: true })),
      ahead: bars,
      ticks: ticksOf(playback.countMarks, stripView, stripWindow.width),
      snapX: snapAt === null ? null : xOfSeconds(snapAt, stripView),
      bands,
      handles,
      centreX: centre,
    },
    lifted,
    transport: {
      playing: playback.state.playing,
      time,
      canUndo: history.canUndo,
      toggle: playback.controls.toggle,
      undo: history.undo,
      fit: () => {
        setChosenPxPerSecond(limits.min);
      },
    },
  };
};

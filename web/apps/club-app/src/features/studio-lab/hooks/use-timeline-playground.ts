import { formatReadoutTime } from '@furria/studio/drag-readout';
import type { GestureIntent, GesturePoint } from '@furria/studio/gesture-recogniser';
import { pulseHaptic } from '@furria/studio/haptics';
import { pickHitTarget } from '@furria/studio/hit-priority';
import { countAt, musicLengthOf, musicSegmentsOf } from '@furria/studio/music-timeline';
import { useGesture } from '@furria/studio/use-gesture';
import type { KkTouchLabHandlers } from '@furria/ui/KkTouchLab';
import type { MotionValue } from 'motion/react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { ActStudio } from '@/features/acts/schemas';
import { labDragStepOf, labPolicyOf } from '../lab-drag';
import type { LabLift } from '../lab-lift';
import { labLiftOf } from '../lab-lift';
import type { StudioLabVariants } from '../schemas';
import { countDetailOf, precisionBadgeOf } from '../studio-lab-copy';
import type { TimelineEdge } from '../timeline-edits';
import { timelineEdgesOf, withEdgeAt } from '../timeline-edits';
import type { Tick, WaveBar } from '../timeline-layers';
import {
  BORDER_ZONE_SHARE,
  edgeTargetsOf,
  loudestPeakOf,
  snapCandidatesOf,
  ticksOf,
  waveBarsOf,
} from '../timeline-layers';
import { secondsOfX, snapSecondsOf, xOfSeconds } from '../timeline-view';
import { useLabHistory } from './use-lab-history';
import { useTimelineViewport } from './use-timeline-viewport';

export interface TimelineBandView {
  key: string;
  x: number;
  width: number;
  label: string;
  selected: boolean;
}

export interface TimelineHandleView {
  key: string;
  x: number;
  kind: TimelineEdge['kind'];
  active: boolean;
}

export interface TimelineLayersView {
  bars: readonly WaveBar[];
  ticks: readonly Tick[];
  snapX: number | null;
  bands: readonly TimelineBandView[];
  handles: readonly TimelineHandleView[];
  playheadX: number;
}

export interface LabReadoutView {
  value: string;
  detail: string | null;
  badge: string | null;
}

export interface LabLiftView {
  lift: LabLift;
  readout: LabReadoutView;
  finger: GesturePoint;
}

export interface LabArea {
  areaRef: (node: HTMLElement | SVGElement | null) => void;
  handlers: KkTouchLabHandlers;
  width: number;
  height: number;
}

export interface LabTransport {
  playing: boolean;
  time: string | MotionValue<string>;
  canUndo: boolean;
  toggle: () => void;
  undo: (() => void) | null;
  fit: (() => void) | null;
}

export interface TimelinePlayground {
  area: LabArea;
  layers: TimelineLayersView;
  lifted: LabLiftView | null;
  transport: LabTransport;
}

type TimelineDrag = { kind: 'edge'; edge: TimelineEdge; x: number } | { kind: 'scrub'; x: number };

interface LiftState {
  finger: GesturePoint;
  seconds: number;
  badge: string | null;
}

export const LOUPE = { diameter: 116, zoom: 2.25 };
export const READOUT_WIDTH = 190;

export const useTimelinePlayground = (
  studio: ActStudio,
  variants: StudioLabVariants,
): TimelinePlayground => {
  const history = useLabHistory(studio);
  const committed = history.value;
  const shown = history.shown;
  const playback = useStudioPlayback(committed, null);
  const seconds = usePlaybackSeconds(playback.player);
  const committedSegments = musicSegmentsOf(committed);
  const segments = musicSegmentsOf(shown);
  const length = musicLengthOf(segments);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [snapAt, setSnapAt] = useState<number | null>(null);
  const lastSnap = useRef<number | null>(null);
  const [lift, setLift] = useState<LiftState | null>(null);
  const drag = useRef<TimelineDrag | null>(null);
  const top = loudestPeakOf(playback.peaksByItem);

  const onIntent = (intent: GestureIntent): void => {
    handleIntent(intent);
  };
  const gesture = useGesture({ policy: labPolicyOf(variants.precision, 'x'), onIntent });
  const width = gesture.areaSize?.width ?? 0;
  const height = gesture.areaSize?.height ?? 0;
  const viewport = useTimelineViewport(length, width);
  const view = viewport.view;
  const edges = timelineEdgesOf(shown, segments);
  const committedEdges = timelineEdgesOf(committed, committedSegments);

  const followPlayhead = useEffectEvent((at: number): void => {
    viewport.follow(at);
  });
  useEffect(() => {
    followPlayhead(seconds);
  }, [seconds]);

  const seek = (x: number): void => {
    playback.controls.seek(Math.min(Math.max(secondsOfX(x, view), 0), length));
  };

  const edgeAt = (point: GesturePoint): TimelineEdge | null => {
    const key = pickHitTarget(edgeTargetsOf(committedEdges, view, height, activeKey), point);

    return committedEdges.find((edge) => edge.key === key) ?? null;
  };

  const stepAt = (point: GesturePoint): number | null => {
    const at = secondsOfX(point.x, view);

    return (
      shown.steps.find(
        (step) =>
          step.startSeconds !== null &&
          step.endSeconds !== null &&
          at >= step.startSeconds &&
          at < step.endSeconds,
      )?.stepId ?? null
    );
  };

  const endDrag = (): void => {
    drag.current = null;
    setActiveKey(null);
    lastSnap.current = null;
    setSnapAt(null);
    setLift(null);
  };

  const handleIntent = (intent: GestureIntent): void => {
    switch (intent.kind) {
      case 'tap': {
        if (intent.point.y < height * BORDER_ZONE_SHARE) {
          const stepId = stepAt(intent.point);
          setSelectedStepId((current) => (current === stepId ? null : stepId));
        }
        seek(intent.point.x);
        return;
      }
      case 'longPress': {
        const edge = edgeAt(intent.point);
        if (edge !== null) {
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
        endDrag();
        return;
      case 'dragStart': {
        const edge = edgeAt(intent.origin);
        drag.current =
          edge === null
            ? { kind: 'scrub', x: intent.origin.x }
            : { kind: 'edge', edge, x: xOfSeconds(edge.seconds, view) };
        setActiveKey(edge?.key ?? null);
        return;
      }
      case 'drag': {
        const current = drag.current;
        if (current === null) {
          return;
        }
        const step = labDragStepOf(variants.precision, intent);
        const x = current.x + step.delta.x;
        drag.current = { ...current, x };
        const raw = Math.min(Math.max(secondsOfX(x, view), 0), length);
        const snap =
          step.tier === 'full'
            ? snapSecondsOf(raw, snapCandidatesOf(playback.countMarks, view), view)
            : { seconds: raw, snapped: false };
        if (snap.snapped && snap.seconds !== lastSnap.current) {
          pulseHaptic();
        }
        lastSnap.current = snap.snapped ? snap.seconds : null;
        setSnapAt(lastSnap.current);
        setLift({
          finger: intent.point,
          seconds: snap.seconds,
          badge: precisionBadgeOf(step.tier),
        });
        if (current.kind === 'edge') {
          history.preview(withEdgeAt(committed, current.edge, snap.seconds, committedSegments));
        } else {
          playback.controls.seek(snap.seconds);
        }
        return;
      }
      case 'dragEnd':
        if (drag.current?.kind === 'edge') {
          history.keep();
        }
        endDrag();
        return;
      case 'dragCancel':
        history.drop();
        endDrag();
        return;
      case 'navigateStart':
        viewport.navigateStart();
        return;
      case 'navigate':
        viewport.navigate({ focal: intent.focal, scale: intent.scale, dx: intent.dx });
        return;
      case 'navigateEnd':
        viewport.navigateEnd(intent.velocity.x);
        return;
      default:
        return;
    }
  };

  const bands = shown.steps.flatMap((step) => {
    if (step.startSeconds === null || step.endSeconds === null) {
      return [];
    }
    const x = xOfSeconds(step.startSeconds, view);
    const end = xOfSeconds(step.endSeconds, view);

    return end < 0 || x > width
      ? []
      : [
          {
            key: String(step.stepId),
            x,
            width: end - x,
            label: step.name,
            selected: step.stepId === selectedStepId,
          },
        ];
  });
  const handles = edges
    .map((edge) => ({
      key: edge.key,
      x: xOfSeconds(edge.seconds, view),
      kind: edge.kind,
      active: edge.key === activeKey,
    }))
    .filter((handle) => handle.x >= -2 && handle.x <= width + 2);
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
      bars: waveBarsOf(segments, playback.peaksByItem, view, width, seconds, top),
      ticks: ticksOf(playback.countMarks, view, width),
      snapX: snapAt === null ? null : xOfSeconds(snapAt, view),
      bands,
      handles,
      playheadX: xOfSeconds(seconds, view),
    },
    lifted,
    transport: {
      playing: playback.state.playing,
      time: formatReadoutTime(seconds),
      canUndo: history.canUndo,
      toggle: playback.controls.toggle,
      undo: history.undo,
      fit: viewport.fit,
    },
  };
};

import type { SpotPath } from '@furria/studio/choreography-motion';
import { formatReadoutTime } from '@furria/studio/drag-readout';
import type { GestureIntent, GesturePoint } from '@furria/studio/gesture-recogniser';
import { pulseHaptic } from '@furria/studio/haptics';
import { pickHitTarget } from '@furria/studio/hit-priority';
import { countAt } from '@furria/studio/music-timeline';
import { useGesture } from '@furria/studio/use-gesture';
import type { StudioPlayback } from '@furria/studio/use-studio-playback';
import type { KkTouchLabKey } from '@furria/ui/KkTouchLab';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { KeyGroup } from '../stage-edits';
import { keyGroupsOf, withGroupRetimed } from '../stage-edits';
import { countDetailOf } from '../studio-lab-copy';
import type { Tick } from '../timeline-layers';
import { snapCandidatesOf, ticksOf } from '../timeline-layers';
import { secondsOfX, snapSecondsOf, xOfSeconds } from '../timeline-view';
import type { LabHistory } from './use-lab-history';
import type { LabArea, LabReadoutView } from './use-timeline-playground';
import { useTimelineViewport } from './use-timeline-viewport';

export interface KeyLane {
  area: LabArea;
  keys: readonly KkTouchLabKey[];
  ticks: readonly Tick[];
  snapX: number | null;
  playheadX: number;
  readout: (LabReadoutView & GesturePoint) | null;
  time: string;
}

interface UseKeyLaneOptions {
  history: LabHistory<SpotPath[]>;
  playback: StudioPlayback;
  seconds: number;
  selected: ReadonlySet<number>;
}

type LaneDrag = { kind: 'key'; group: KeyGroup; x: number } | { kind: 'scrub'; x: number };

const LANE_POLICY = { drag: true, navigate: true, longPress: false, precision: 'none' } as const;
const KEY_BOX = 16;
const READOUT_LIFT = 44;

export const useKeyLane = ({
  history,
  playback,
  seconds,
  selected,
}: UseKeyLaneOptions): KeyLane => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [snapAt, setSnapAt] = useState<number | null>(null);
  const lastSnap = useRef<number | null>(null);
  const [readout, setReadout] = useState<{ x: number; seconds: number } | null>(null);
  const drag = useRef<LaneDrag | null>(null);
  const onIntent = (intent: GestureIntent): void => {
    handleIntent(intent);
  };
  const gesture = useGesture({ policy: LANE_POLICY, onIntent });
  const width = gesture.areaSize?.width ?? 0;
  const height = gesture.areaSize?.height ?? 0;
  const viewport = useTimelineViewport(playback.length, width);
  const view = viewport.view;
  const committedGroups = keyGroupsOf(history.value, selected);
  const groups = keyGroupsOf(history.shown, selected);

  const followPlayhead = useEffectEvent((at: number): void => {
    viewport.follow(at);
  });
  useEffect(() => {
    followPlayhead(seconds);
  }, [seconds]);

  const groupAt = (point: GesturePoint): KeyGroup | null => {
    const key = pickHitTarget(
      committedGroups.map((group) => ({
        id: group.key,
        x: xOfSeconds(group.seconds, view) - KEY_BOX / 2,
        y: 0,
        width: KEY_BOX,
        height,
        priority: 0,
        selected: false,
      })),
      point,
    );

    return committedGroups.find((group) => group.key === key) ?? null;
  };

  const handleIntent = (intent: GestureIntent): void => {
    switch (intent.kind) {
      case 'tap':
        playback.controls.seek(Math.max(secondsOfX(intent.point.x, view), 0));
        return;
      case 'dragStart': {
        const group = groupAt(intent.origin);
        drag.current =
          group === null
            ? { kind: 'scrub', x: intent.origin.x }
            : { kind: 'key', group, x: xOfSeconds(group.seconds, view) };
        setActiveKey(group?.key ?? null);
        return;
      }
      case 'drag': {
        const current = drag.current;
        if (current === null) {
          return;
        }
        const x = current.x + intent.delta.x;
        drag.current = { ...current, x };
        const snap = snapSecondsOf(
          Math.min(Math.max(secondsOfX(x, view), 0), playback.length),
          snapCandidatesOf(playback.countMarks, view),
          view,
        );
        if (snap.snapped && snap.seconds !== lastSnap.current) {
          pulseHaptic();
        }
        lastSnap.current = snap.snapped ? snap.seconds : null;
        setSnapAt(lastSnap.current);
        setReadout({ x: intent.point.x, seconds: snap.seconds });
        if (current.kind === 'key') {
          history.preview(withGroupRetimed(history.value, current.group, snap.seconds));
        } else {
          playback.controls.seek(snap.seconds);
        }
        return;
      }
      case 'dragEnd':
      case 'dragCancel':
        if (drag.current?.kind === 'key') {
          if (intent.kind === 'dragEnd') {
            history.keep();
          } else {
            history.drop();
          }
        }
        drag.current = null;
        setActiveKey(null);
        lastSnap.current = null;
        setSnapAt(null);
        setReadout(null);
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

  return {
    area: { areaRef: gesture.areaRef, handlers: gesture.handlers, width, height },
    keys: groups
      .map((group) => ({
        key: group.key,
        x: xOfSeconds(group.seconds, view),
        state:
          group.key === activeKey
            ? ('lifted' as const)
            : selected.size > 0
              ? ('selected' as const)
              : ('idle' as const),
      }))
      .filter((key) => key.x >= -KEY_BOX && key.x <= width + KEY_BOX),
    ticks: ticksOf(playback.countMarks, view, width),
    snapX: snapAt === null ? null : xOfSeconds(snapAt, view),
    playheadX: xOfSeconds(seconds, view),
    readout:
      readout === null
        ? null
        : {
            x: readout.x,
            y: -READOUT_LIFT,
            value: formatReadoutTime(readout.seconds),
            detail: countDetailOf(countAt(playback.segments, readout.seconds)),
            badge: null,
          },
    time: formatReadoutTime(seconds),
  };
};

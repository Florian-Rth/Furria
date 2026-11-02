import type { SpotPath, StagePoint } from '@furria/studio/choreography-motion';
import { pointOnMove, posesAt, spotPathsOf } from '@furria/studio/choreography-motion';
import type { GestureIntent, GesturePoint } from '@furria/studio/gesture-recogniser';
import { pulseHaptic } from '@furria/studio/haptics';
import type { HitTarget } from '@furria/studio/hit-priority';
import { pickHitTarget } from '@furria/studio/hit-priority';
import { musicSegmentsOf } from '@furria/studio/music-timeline';
import { stageOrDefault } from '@furria/studio/stage-view';
import { useGesture } from '@furria/studio/use-gesture';
import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';
import type { KkTouchLabDotState, KkTouchLabGridLine, KkTouchLabPath } from '@furria/ui/KkTouchLab';
import { useKkSheetCommands } from '@furria/ui/sheet-store';
import { useEffect, useRef, useState } from 'react';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import { labDragStepOf, labPolicyOf } from '../lab-drag';
import { labLiftOf } from '../lab-lift';
import type { StudioLabVariants } from '../schemas';
import type { SpotMove } from '../stage-edits';
import {
  bendPointOf,
  linedUpPlaces,
  mirroredPlaces,
  moveAt,
  withBend,
  withSpotsPlaced,
} from '../stage-edits';
import type { StageFrame } from '../stage-frame';
import {
  fitFrame,
  gridLinesOf,
  metresOfDelta,
  pxOfStagePoint,
  snappedStagePoint,
  zoomedFrame,
} from '../stage-frame';
import { precisionBadgeOf, spotLabelOf, stagePlaceOf } from '../studio-lab-copy';
import type { KeyLane } from './use-key-lane';
import { useKeyLane } from './use-key-lane';
import { useLabHistory } from './use-lab-history';
import type { LabArea, LabLiftView, LabTransport } from './use-timeline-playground';
import { LOUPE } from './use-timeline-playground';

export interface StageDotView {
  spotId: number;
  number: number;
  x: number;
  y: number;
  state: KkTouchLabDotState;
  open: boolean;
}

export interface StageLayersView {
  floor: { x: number; y: number; width: number; height: number };
  columns: readonly KkTouchLabGridLine[];
  rows: readonly KkTouchLabGridLine[];
  snapX: number | null;
  snapY: number | null;
  paths: readonly KkTouchLabPath[];
  bend: { x: number; y: number; active: boolean } | null;
  dots: readonly StageDotView[];
}

export interface StageSelectionActions {
  count: number;
  toolbar: GesturePoint | null;
  clear: () => void;
  mirror: () => void;
  lineUp: () => void;
}

export interface StagePlayground {
  area: LabArea;
  layers: StageLayersView;
  lifted: LabLiftView | null;
  selection: StageSelectionActions;
  lane: KeyLane;
  transport: LabTransport;
}

type StageDrag =
  | { kind: 'dots'; primary: number; bases: ReadonlyMap<number, StagePoint>; acc: GesturePoint }
  | { kind: 'bend'; move: SpotMove; base: StagePoint; acc: GesturePoint };

interface StageLift {
  finger: GesturePoint;
  text: string;
  detail: string | null;
  badge: string | null;
}

export const SELECTION_SHEET_ID = 'studio-lab-selection';
const PATH_SAMPLES = 24;
const DOT_BOX = 28;
const TOOLBAR_GAP = 30;
const TOOLBAR_HALF_WIDTH = 140;
const SHEET_AFTER_LIFT_MS = 320;
const STAGE_READOUT_WIDTH = 230;

const defaultPlaceOf = (index: number, count: number): StagePoint => ({
  rightMetres: index - (count - 1) / 2,
  backMetres: 1,
});

const movePathOf = (
  move: SpotMove,
  toPx: (point: StagePoint) => GesturePoint,
  bend: StagePoint | null,
): string =>
  Array.from({ length: PATH_SAMPLES + 1 }, (_, step) => {
    const point = toPx(
      pointOnMove(move.from.position, move.to.position, bend, step / PATH_SAMPLES),
    );

    return `${step === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }).join('');

export const useStagePlayground = (
  studio: Studio,
  variants: StudioLabVariants,
): StagePlayground => {
  const history = useLabHistory<SpotPath[]>(
    spotPathsOf(studio.choreography, musicSegmentsOf(studio)),
  );
  const playback = useStudioPlayback(studio, null);
  const seconds = usePlaybackSeconds(playback.player);
  const stage = stageOrDefault(studio.stage);
  const sheets = useKkSheetCommands();
  const [chosenFrame, setChosenFrame] = useState<StageFrame | null>(null);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [lift, setLift] = useState<StageLift | null>(null);
  const [snap, setSnap] = useState<{ right: number | null; back: number | null }>({
    right: null,
    back: null,
  });
  const [dragging, setDragging] = useState<ReadonlySet<number>>(new Set());
  const [bending, setBending] = useState(false);
  const drag = useRef<StageDrag | null>(null);
  const held = useRef(false);
  const lastSnap = useRef<{ right: number | null; back: number | null }>({
    right: null,
    back: null,
  });
  const sheetTimer = useRef<number | null>(null);
  const cancelSheet = (): void => {
    if (sheetTimer.current !== null) {
      window.clearTimeout(sheetTimer.current);
    }
    sheetTimer.current = null;
  };
  useEffect(
    () => () => {
      if (sheetTimer.current !== null) {
        window.clearTimeout(sheetTimer.current);
      }
    },
    [],
  );

  const onIntent = (intent: GestureIntent): void => {
    handleIntent(intent);
  };
  const gesture = useGesture({ policy: labPolicyOf(variants.precision, 'none'), onIntent });
  const width = gesture.areaSize?.width ?? 0;
  const height = gesture.areaSize?.height ?? 0;
  const fit = fitFrame(stage, width, height);
  const frame = chosenFrame ?? fit;
  const toPx = (point: StagePoint): GesturePoint => pxOfStagePoint(point, stage, frame);
  const spots = [...studio.spots].sort((left, right) => left.number - right.number);
  const poses = new Map(
    posesAt(history.shown, seconds).map((pose) => [pose.spotId, pose.position]),
  );
  const placeOf = (spotId: number): StagePoint => {
    const index = spots.findIndex((spot) => spot.spotId === spotId);

    return poses.get(spotId) ?? defaultPlaceOf(index, spots.length);
  };
  const committedPoses = new Map(
    posesAt(history.value, seconds).map((pose) => [pose.spotId, pose.position]),
  );
  const committedPlaceOf = (spotId: number): StagePoint => {
    const index = spots.findIndex((spot) => spot.spotId === spotId);

    return committedPoses.get(spotId) ?? defaultPlaceOf(index, spots.length);
  };
  const primary = selected.at(-1) ?? null;
  const primaryPath = history.shown.find((path) => path.spotId === primary) ?? null;
  const primaryMove = primaryPath === null ? null : moveAt(primaryPath, seconds);
  const committedPath = history.value.find((path) => path.spotId === primary) ?? null;
  const committedMove = committedPath === null ? null : moveAt(committedPath, seconds);
  const selectedSet = new Set(selected);
  const lane = useKeyLane({ history, playback, seconds, selected: selectedSet });

  const targetsOf = (): HitTarget<string>[] => {
    const dots = spots.map((spot) => {
      const px = toPx(committedPlaceOf(spot.spotId));

      return {
        id: `dot:${spot.spotId}`,
        x: px.x - DOT_BOX / 2,
        y: px.y - DOT_BOX / 2,
        width: DOT_BOX,
        height: DOT_BOX,
        priority: 0,
        selected: selectedSet.has(spot.spotId),
      };
    });
    if (committedMove === null) {
      return dots;
    }
    const bend = toPx(bendPointOf(committedMove));

    return [
      ...dots,
      {
        id: 'bend',
        x: bend.x - DOT_BOX / 4,
        y: bend.y - DOT_BOX / 4,
        width: DOT_BOX / 2,
        height: DOT_BOX / 2,
        priority: 2,
        selected: false,
      },
    ];
  };

  const hitAt = (point: GesturePoint): string | null => pickHitTarget(targetsOf(), point);
  const spotOfHit = (hit: string | null): number | null =>
    hit?.startsWith('dot:') === true ? Number(hit.slice('dot:'.length)) : null;

  const endDrag = (): void => {
    drag.current = null;
    setDragging(new Set());
    setBending(false);
    setLift(null);
    lastSnap.current = { right: null, back: null };
    setSnap(lastSnap.current);
  };

  const placeSelection = (places: ReadonlyMap<number, StagePoint>): void => {
    history.replace(withSpotsPlaced(history.value, seconds, places));
  };
  const selectedPlaces = (): Map<number, StagePoint> =>
    new Map(selected.map((spotId) => [spotId, committedPlaceOf(spotId)]));

  const followDots = (
    current: Extract<StageDrag, { kind: 'dots' }>,
    finger: GesturePoint,
    tier: ReturnType<typeof labDragStepOf>['tier'],
  ): void => {
    const base = current.bases.get(current.primary);
    if (base === undefined) {
      return;
    }
    const moved = metresOfDelta(current.acc, frame);
    const target = snappedStagePoint(
      {
        rightMetres: base.rightMetres + moved.rightMetres,
        backMetres: base.backMetres + moved.backMetres,
      },
      stage,
      frame,
      tier === 'full',
    );
    const shift = {
      rightMetres: target.point.rightMetres - base.rightMetres,
      backMetres: target.point.backMetres - base.backMetres,
    };
    const places = new Map(
      [...current.bases.entries()].map(([spotId, point]) => [
        spotId,
        snappedStagePoint(
          {
            rightMetres: point.rightMetres + shift.rightMetres,
            backMetres: point.backMetres + shift.backMetres,
          },
          stage,
          frame,
          false,
        ).point,
      ]),
    );
    if (
      (target.snapRight !== null && target.snapRight !== lastSnap.current.right) ||
      (target.snapBack !== null && target.snapBack !== lastSnap.current.back)
    ) {
      pulseHaptic();
    }
    lastSnap.current = { right: target.snapRight, back: target.snapBack };
    setSnap(lastSnap.current);
    history.preview(withSpotsPlaced(history.value, seconds, places));
    const number = spots.find((spot) => spot.spotId === current.primary)?.number ?? 0;
    setLift({
      finger,
      text: stagePlaceOf(target.point.rightMetres, target.point.backMetres),
      detail: spotLabelOf(number),
      badge: precisionBadgeOf(tier),
    });
  };

  const followBend = (
    current: Extract<StageDrag, { kind: 'bend' }>,
    finger: GesturePoint,
    tier: ReturnType<typeof labDragStepOf>['tier'],
  ): void => {
    const moved = metresOfDelta(current.acc, frame);
    const target = snappedStagePoint(
      {
        rightMetres: current.base.rightMetres + moved.rightMetres,
        backMetres: current.base.backMetres + moved.backMetres,
      },
      stage,
      frame,
      tier === 'full',
    );
    lastSnap.current = { right: target.snapRight, back: target.snapBack };
    setSnap(lastSnap.current);
    history.preview(
      withBend(history.value, current.move.spotId, current.move.toIndex, target.point),
    );
    setLift({
      finger,
      text: stagePlaceOf(target.point.rightMetres, target.point.backMetres),
      detail: null,
      badge: precisionBadgeOf(tier),
    });
  };

  const handleIntent = (intent: GestureIntent): void => {
    switch (intent.kind) {
      case 'tap': {
        const spotId = spotOfHit(hitAt(intent.point));
        setSelected((current) =>
          spotId === null || (current.length === 1 && current[0] === spotId) ? [] : [spotId],
        );
        return;
      }
      case 'longPress': {
        cancelSheet();
        const spotId = spotOfHit(hitAt(intent.point));
        held.current = spotId !== null;
        if (spotId !== null) {
          pulseHaptic();
          setSelected((current) => (current.includes(spotId) ? current : [...current, spotId]));
        }
        return;
      }
      case 'holdEnd':
        if (held.current && variants.selection === 'sheet') {
          cancelSheet();
          sheetTimer.current = window.setTimeout(() => {
            sheetTimer.current = null;
            sheets.open(SELECTION_SHEET_ID);
          }, SHEET_AFTER_LIFT_MS);
        }
        held.current = false;
        return;
      case 'dragStart': {
        cancelSheet();
        held.current = false;
        const hit = hitAt(intent.origin);
        if (hit === 'bend' && committedMove !== null) {
          drag.current = {
            kind: 'bend',
            move: committedMove,
            base: bendPointOf(committedMove),
            acc: { x: 0, y: 0 },
          };
          setBending(true);
          return;
        }
        const spotId = spotOfHit(hit);
        if (spotId === null) {
          drag.current = null;
          return;
        }
        const group = selectedSet.has(spotId)
          ? [...selected.filter((id) => id !== spotId), spotId]
          : [spotId];
        setSelected(group);
        drag.current = {
          kind: 'dots',
          primary: spotId,
          bases: new Map(group.map((id) => [id, committedPlaceOf(id)])),
          acc: { x: 0, y: 0 },
        };
        setDragging(new Set(group));
        return;
      }
      case 'drag': {
        const current = drag.current;
        if (current === null) {
          return;
        }
        const step = labDragStepOf(variants.precision, intent);
        const acc = { x: current.acc.x + step.delta.x, y: current.acc.y + step.delta.y };
        if (current.kind === 'dots') {
          const next = { ...current, acc };
          drag.current = next;
          followDots(next, intent.point, step.tier);
        } else {
          const next = { ...current, acc };
          drag.current = next;
          followBend(next, intent.point, step.tier);
        }
        return;
      }
      case 'dragEnd':
        if (drag.current !== null) {
          history.keep();
        }
        endDrag();
        return;
      case 'dragCancel':
        history.drop();
        endDrag();
        return;
      case 'navigate':
        setChosenFrame(zoomedFrame(frame, fit, intent.scale, intent.focal, intent.dx, intent.dy));
        return;
      default:
        return;
    }
  };

  const grid = gridLinesOf(stage, frame);
  const dots = spots.map((spot) => {
    const px = toPx(placeOf(spot.spotId));
    const state: KkTouchLabDotState = dragging.has(spot.spotId)
      ? 'lifted'
      : selectedSet.has(spot.spotId)
        ? 'selected'
        : 'idle';

    return {
      spotId: spot.spotId,
      number: spot.number,
      x: px.x,
      y: px.y,
      state,
      open: spot.person === null,
    };
  });
  const paths = selected.flatMap((spotId) => {
    const path = history.shown.find((candidate) => candidate.spotId === spotId);
    const move = path === undefined ? null : moveAt(path, seconds);

    return move === null
      ? []
      : [
          {
            key: String(spotId),
            d: movePathOf(move, toPx, move.to.bend),
            active: spotId === primary,
          },
        ];
  });
  const bendPx = primaryMove === null ? null : toPx(bendPointOf(primaryMove));
  const selectedDots = dots.filter((dot) => selectedSet.has(dot.spotId));
  const toolbar =
    variants.selection === 'toolbar' && selectedDots.length > 0 && dragging.size === 0 && !bending
      ? {
          x: Math.min(
            Math.max(
              selectedDots.reduce((sum, dot) => sum + dot.x, 0) / selectedDots.length,
              TOOLBAR_HALF_WIDTH,
            ),
            Math.max(width - TOOLBAR_HALF_WIDTH, TOOLBAR_HALF_WIDTH),
          ),
          y: Math.min(...selectedDots.map((dot) => dot.y)) - TOOLBAR_GAP,
        }
      : null;
  const snapPx = toPx({ rightMetres: snap.right ?? 0, backMetres: snap.back ?? 0 });
  const lifted =
    lift === null
      ? null
      : {
          finger: lift.finger,
          lift: labLiftOf(
            lift.finger,
            width,
            STAGE_READOUT_WIDTH,
            variants.lift === 'loupe' ? LOUPE : null,
            0,
          ),
          readout: { value: lift.text, detail: lift.detail, badge: lift.badge },
        };

  return {
    area: { areaRef: gesture.areaRef, handlers: gesture.handlers, width, height },
    layers: {
      floor: {
        x: frame.x,
        y: frame.y,
        width: stage.widthMetres * frame.scale,
        height: stage.depthMetres * frame.scale,
      },
      columns: grid.columns,
      rows: grid.rows,
      snapX: snap.right === null ? null : snapPx.x,
      snapY: snap.back === null ? null : snapPx.y,
      paths,
      bend: bendPx === null ? null : { ...bendPx, active: bending },
      dots,
    },
    lifted,
    selection: {
      count: selected.length,
      toolbar,
      clear: () => {
        cancelSheet();
        setSelected([]);
        sheets.close();
      },
      mirror: () => placeSelection(mirroredPlaces(selectedPlaces())),
      lineUp: () => placeSelection(linedUpPlaces(selectedPlaces())),
    },
    lane,
    transport: {
      playing: playback.state.playing,
      time: lane.time,
      canUndo: history.canUndo,
      toggle: playback.controls.toggle,
      undo: history.undo,
      fit: () => setChosenFrame(null),
    },
  };
};

import type { KkStudioGStageGestures, KkStudioGStageShareBox } from '@furria/ui/KkStudioGStage';
import { useRef, useState } from 'react';
import type { StagePoint } from '@/features/act-player/choreography-motion';
import { poseAt } from '@/features/act-player/choreography-motion';
import type { StageViewpoint } from '@/features/act-player/stage-view';
import type { StudioGDesk } from '../studio-g-desk';
import {
  draggedPointOf,
  heldIndexesOf,
  keyframeKeyOf,
  nearestKeyframeSecondsOf,
} from '../studio-g-edits';
import {
  boxedSelectionOf,
  pressedSpotsOf,
  selectedSpotIdsOf,
  spotsInBoxOf,
} from '../studio-g-selection';
import { editDotsAt } from '../studio-g-stage';

export interface StudioGStage {
  gestures: KkStudioGStageGestures;
  box: KkStudioGStageShareBox | null;
  dragging: boolean;
  selectedIds: readonly number[];
}

export const useStudioGStage = (desk: StudioGDesk, viewpoint: StageViewpoint): StudioGStage => {
  const { playback, studio, edits, picked } = desk;
  const { player, paths, stage } = playback;
  const [box, setBox] = useState<KkStudioGStageShareBox | null>(null);
  const [dragging, setDragging] = useState(false);
  const pressedIds = useRef<readonly number[]>([]);
  const pressedSpot = useRef<number | null>(null);
  const dragFrom = useRef(new Map<string, StagePoint>());
  const selectedIds = selectedSpotIdsOf(picked.selection);

  const startDrag = (): void => {
    if (player.state().playing) {
      player.pause();
    }
    let seconds = player.position();
    const pressedPath = paths.find((path) => path.spotId === pressedSpot.current);
    if (pressedPath !== undefined && poseAt(pressedPath, seconds)?.moving === true) {
      seconds = nearestKeyframeSecondsOf(pressedPath, seconds) ?? seconds;
      player.seek(seconds);
    }
    const from = new Map<string, StagePoint>();
    for (const path of paths.filter((candidate) => pressedIds.current.includes(candidate.spotId))) {
      for (const index of heldIndexesOf(path, seconds)) {
        const keyframe = path.keyframes[index];
        if (keyframe !== undefined) {
          from.set(keyframeKeyOf(path.spotId, index), keyframe.position);
        }
      }
    }
    dragFrom.current = from;
    setDragging(true);
  };

  return {
    box,
    dragging,
    selectedIds,
    gestures: {
      onDotDown: (spotId, additive) => {
        const keep = !additive && selectedIds.includes(spotId);
        const next = keep ? picked.selection : pressedSpotsOf(picked.selection, spotId, additive);
        pressedSpot.current = spotId;
        pressedIds.current = selectedSpotIdsOf(next);
        if (!keep) {
          picked.select(next);
        }
      },
      onDragStart: startDrag,
      onDrag: (dx, dy) => {
        const moved = new Map<string, StagePoint>();
        for (const [key, origin] of dragFrom.current) {
          moved.set(key, draggedPointOf(origin, { x: dx, y: dy }, stage, viewpoint));
        }
        edits.setMoves(moved);
      },
      onDragEnd: () => {
        setDragging(false);
      },
      onBox: setBox,
      onBoxEnd: (shareBox) => {
        const dots = editDotsAt(paths, studio.spots, stage, viewpoint, [], player.position());
        picked.select(boxedSelectionOf(spotsInBoxOf(dots, shareBox)));
      },
      onEmptyTap: picked.clear,
    },
  };
};

import type { SpotPath, StagePoint } from '@furria/studio/choreography-motion';
import { poseAt } from '@furria/studio/choreography-motion';
import type { StageScene } from '@furria/studio/practice-stage';
import { viewShareOf } from '@furria/studio/practice-stage';
import type { StageShare, TimeSpan } from '@furria/studio/studio-edits';
import { draggedPointOf } from '@furria/studio/studio-edits';
import type { FormationPreset } from '@furria/studio/studio-formation';
import {
  formationAt,
  formationPlacedOf,
  freePointOf,
  grabbedSpotsOf,
  mirroredOf,
  presetPointsOf,
  shownSelectionOf,
} from '@furria/studio/studio-formation';
import type { StudioSpot } from '@furria/studio/studio-schemas';
import type { StudioWorkScreen } from '@furria/studio/studio-work-screen';
import type { ActStudioMovement } from '@furria/studio/use-act-studio-movement';
import { useActStudioMovement } from '@furria/studio/use-act-studio-movement';
import type { StudioTracks } from '@furria/studio/use-track-commit';
import { useTrackCommit } from '@furria/studio/use-track-commit';
import { useLayoutEffect, useRef, useState } from 'react';

const AT_BORDER_SECONDS = 0.02;

export interface ActStudioOnionPoint {
  key: string;
  x: number;
  y: number;
}

export interface ActStudioStage {
  scene: StageScene;
  movement: ActStudioMovement;
  selected: readonly number[];
  toolbar: boolean;
  onion: boolean;
  onionPoints: ActStudioOnionPoint[];
  formation: boolean;
  formationSeconds: number;
  previousSeconds: number | null;
  tap: (spotId: number | null) => void;
  hold: (spotId: number) => void;
  grab: (spotId: number, share: StageShare) => readonly number[] | null;
  move: (share: StageShare) => ReadonlyMap<number, StagePoint>;
  end: () => void;
  cancel: () => void;
  nudge: (spotId: number, right: number, down: number) => void;
  forget: (spotId: number) => void;
  toggleOnion: () => void;
  mirror: () => void;
  preset: (kind: FormationPreset) => void;
  addSpot: () => void;
}

interface Grab {
  start: StageShare;
  origins: ReadonlyMap<number, StagePoint>;
  placed: StudioTracks | null;
}

const NUDGE_METRES = 0.5;
const NUDGE_START: StageShare = { x: 0, y: 0 };

const byNumber = (spots: readonly StudioSpot[]): StudioSpot[] =>
  [...spots].sort((left, right) => left.number - right.number);

export const useActStudioStage = (screen: StudioWorkScreen): ActStudioStage => {
  const { playback, practice, studio, mode, stageDocument } = screen;
  const { player, paths, stage, ownSpotId, steps, controls, length } = playback;
  const writes = useTrackCommit(screen);
  const { preview, commit, drop } = writes;
  const [picked, setPicked] = useState<readonly number[]>([]);
  const [toolbar, setToolbar] = useState(false);
  const [onion, setOnion] = useState(false);
  const grab = useRef<Grab | null>(null);
  const pending = useRef<readonly number[] | null>(null);
  useLayoutEffect(() => {
    pending.current = null;
  });
  const formation = mode.tool === 'formation';
  const moving = mode.tool === 'movement';
  const step = practice.step;
  const stepIndex = steps.findIndex((candidate) => candidate.stepId === step?.stepId);
  const formationSeconds = step?.startSeconds ?? 0;
  const span: TimeSpan = { start: formationSeconds, end: step?.endSeconds ?? length };
  const previous = steps[stepIndex - 1] ?? null;
  const previousSeconds = previous?.startSeconds ?? null;
  const pathOf = (spotId: number): SpotPath | null =>
    paths.find((path) => path.spotId === spotId) ?? null;
  const current = formationAt(paths, formationSeconds);
  const selected = shownSelectionOf(picked, current);
  const movement = useActStudioMovement(screen, selected, writes);
  const onionSeconds = !onion
    ? null
    : formation
      ? previousSeconds
      : moving
        ? formationSeconds
        : null;
  const targets =
    selected.length > 0 ? selected : byNumber(studio.spots).map((spot) => spot.spotId);

  const placed = (moves: ReadonlyMap<number, StagePoint>): StudioTracks => {
    const tracks: StudioTracks = {};
    for (const [spotId, point] of moves) {
      tracks[spotId] = formationPlacedOf(spotId, pathOf(spotId)?.keyframes ?? [], span, point);
    }
    preview(tracks);
    return tracks;
  };

  const settle = (moves: ReadonlyMap<number, StagePoint>): void => {
    if (moves.size > 0) {
      commit(placed(moves));
    }
  };

  const pointsOf = (ids: readonly number[]): Map<number, StagePoint> => {
    const origins = new Map<number, StagePoint>();
    for (const id of ids) {
      const point = current.get(id);
      if (point !== undefined) {
        origins.set(id, point);
      }
    }
    return origins;
  };

  const rearranged = (change: (points: StagePoint[]) => StagePoint[]): void => {
    const origins = pointsOf(selected);
    const moved = change([...origins.values()]);
    settle(
      new Map(
        [...origins.keys()].map((id, index) => [
          id,
          moved[index] ?? { rightMetres: 0, backMetres: 0 },
        ]),
      ),
    );
  };

  const nextSelection = (spotId: number, playing: boolean): readonly number[] =>
    grabbedSpotsOf({ selected: pending.current ?? selected, spotId, playing });

  const grabbed = (spotId: number, share: StageShare): readonly number[] | null => {
    if (!formation && !moving) {
      return null;
    }
    const chosen = nextSelection(spotId, player.state().playing);
    if (!(pending.current ?? selected).includes(spotId)) {
      setToolbar(false);
    }
    setPicked(chosen);
    grab.current = null;
    if (moving) {
      movement.grab(chosen, share);
      return chosen;
    }
    if (player.state().playing) {
      controls.toggle();
    }
    if (Math.abs(player.position() - formationSeconds) > AT_BORDER_SECONDS) {
      player.seek(formationSeconds);
    }
    grab.current = { start: share, origins: pointsOf(chosen), placed: null };
    return chosen;
  };

  const moved = (share: StageShare): ReadonlyMap<number, StagePoint> => {
    const held = grab.current;
    if (held === null) {
      return movement.drag(share);
    }
    const delta = { x: share.x - held.start.x, y: share.y - held.start.y };
    const moves = new Map<number, StagePoint>();
    for (const [id, origin] of held.origins) {
      moves.set(id, draggedPointOf(origin, delta, stage));
    }
    held.placed = placed(moves);
    return moves;
  };

  const ended = (): void => {
    const held = grab.current;
    grab.current = null;
    movement.release();
    if (held !== null && held.placed !== null) {
      commit(held.placed);
    }
  };

  return {
    scene: { paths, spots: studio.spots, ownSpotId, stage },
    movement,
    selected,
    toolbar,
    onion,
    onionPoints:
      onionSeconds === null
        ? []
        : paths.flatMap((path) => {
            const point = poseAt(path, onionSeconds)?.position ?? null;
            if (point === null) {
              return [];
            }
            const share = viewShareOf(point, stage);
            return [{ key: String(path.spotId), x: share.x, y: share.y }];
          }),
    formation,
    formationSeconds,
    previousSeconds,
    tap: (spotId) => {
      setToolbar(false);
      setPicked(
        spotId === null || (selected.length === 1 && selected[0] === spotId) ? [] : [spotId],
      );
    },
    hold: (spotId) => {
      setToolbar(true);
      const base = pending.current ?? selected;
      const next = base.includes(spotId) ? base : [...base, spotId];
      pending.current = next;
      setPicked(next);
    },
    grab: grabbed,
    move: moved,
    end: ended,
    cancel: () => {
      const held = grab.current;
      grab.current = null;
      movement.cancel();
      if (held !== null && held.placed !== null) {
        drop(held.placed);
      }
    },
    nudge: (spotId, right, down) => {
      if (grabbed(spotId, NUDGE_START) === null) {
        return;
      }
      moved({
        x: (right * NUDGE_METRES) / stage.widthMetres,
        y: (down * NUDGE_METRES) / stage.depthMetres,
      });
      ended();
    },
    forget: (spotId) => {
      setPicked((chosen) => chosen.filter((id) => id !== spotId));
    },
    toggleOnion: () => {
      setOnion((on) => !on);
    },
    mirror: () => {
      rearranged((points) => points.map(mirroredOf));
    },
    preset: (kind) => {
      const points = presetPointsOf(kind, targets.length, stage);
      settle(
        new Map(
          targets.map((id, index) => [id, points[index] ?? { rightMetres: 0, backMetres: 0 }]),
        ),
      );
    },
    addSpot: () => {
      stageDocument.startGesture();
      const spotId = stageDocument.addSpot();
      settle(new Map([[spotId, freePointOf([...current.values()], stage)]]));
      stageDocument.endGesture();
      setPicked([spotId]);
    },
  };
};

import { useRef, useState } from 'react';
import type {
  SpotPath,
  StagePoint,
  TimedKeyframe,
} from '@/features/act-player/choreography-motion';
import { poseAt } from '@/features/act-player/choreography-motion';
import type { StageScene } from '@/features/act-practice/practice-stage';
import { viewShareOf } from '@/features/act-practice/practice-stage';
import type { StudioSpot } from '@/features/acts/schemas';
import type { AddedSpot } from '../schemas';
import { formationTextOf, selectionTextOf, spotTitleOf } from '../studio-copy';
import type { StageShare, TimeSpan } from '../studio-edits';
import { draggedPointOf } from '../studio-edits';
import type { ArrangeAxis, FormationPreset } from '../studio-formation';
import {
  alignedOf,
  anchoredTrackOf,
  distributedOf,
  formationAt,
  formationPlacedOf,
  freePointOf,
  mirroredOf,
  presetPointsOf,
} from '../studio-formation';
import type { StudioScreen } from './use-studio-screen';

const AT_BORDER_SECONDS = 0.02;

type Tracks = Record<number, readonly TimedKeyframe[]>;

export interface ActStudioOnionPoint {
  key: string;
  x: number;
  y: number;
}

export interface ActStudioStage {
  scene: StageScene;
  selected: readonly number[];
  multi: boolean;
  onion: boolean;
  onionPoints: ActStudioOnionPoint[];
  formation: boolean;
  formationText: string;
  selectionText: string;
  sheetOpen: boolean;
  canMirror: boolean;
  canAlign: boolean;
  canDistribute: boolean;
  formationSeconds: number;
  previousSeconds: number | null;
  copySource: number;
  copySteps: number;
  press: (spotId: number, share: StageShare) => void;
  move: (share: StageShare) => void;
  end: () => void;
  clear: () => void;
  choose: (spotId: number) => void;
  forget: (spotId: number) => void;
  toggleMulti: () => void;
  toggleOnion: () => void;
  mirror: () => void;
  align: (axis: ArrangeAxis) => void;
  distribute: (axis: ArrangeAxis) => void;
  preset: (kind: FormationPreset) => void;
  pickCopySource: (direction: -1 | 1) => void;
  copy: () => void;
  addSpot: () => void;
  openSheet: () => void;
  closeSheet: () => void;
}

interface Grab {
  start: StageShare;
  origins: ReadonlyMap<number, StagePoint>;
  placed: Tracks | null;
}

const nameOf = (spot: StudioSpot | undefined): string | null => spot?.person?.firstName ?? null;

const byNumber = (spots: readonly StudioSpot[]): StudioSpot[] =>
  [...spots].sort((left, right) => left.number - right.number);

export const useActStudioStage = (screen: StudioScreen): ActStudioStage => {
  const { playback, practice, studio, edits, mode, stageWrites } = screen;
  const { player, paths, stage, ownSpotId, steps, controls, segments, length } = playback;
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [multi, setMulti] = useState(false);
  const [onion, setOnion] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [copyPick, setCopyPick] = useState<number | null>(null);
  const [copyPickStep, setCopyPickStep] = useState<number | undefined>(undefined);
  const grab = useRef<Grab | null>(null);
  const formation = mode.tool === 'formation';
  const step = practice.step;
  const stepIndex = steps.findIndex((candidate) => candidate.stepId === step?.stepId);
  if (copyPickStep !== step?.stepId) {
    setCopyPickStep(step?.stepId);
    setCopyPick(null);
  }
  const formationSeconds = step?.startSeconds ?? 0;
  const span: TimeSpan = { start: formationSeconds, end: step?.endSeconds ?? length };
  const previous = steps[stepIndex - 1] ?? null;
  const previousSeconds = previous?.startSeconds ?? null;
  const copySource = Math.min(steps.length - 1, Math.max(0, copyPick ?? stepIndex - 1));
  const pathOf = (spotId: number): SpotPath | null =>
    paths.find((path) => path.spotId === spotId) ?? null;
  const current = formationAt(paths, formationSeconds);
  const targets =
    selected.length > 0 ? selected : byNumber(studio.spots).map((spot) => spot.spotId);

  const commit = (tracks: Tracks): void => {
    const stored = studio.choreography?.tracks ?? [];
    const changes = Object.fromEntries(
      Object.entries(tracks).map(([spotId, keyframes]) => [
        spotId,
        anchoredTrackOf(
          stored.find((track) => track.spotId === Number(spotId))?.keyframes ?? [],
          keyframes,
          segments,
          stage,
        ),
      ]),
    );
    const drop = (): void => {
      edits.dropTracks(tracks);
    };
    void stageWrites.save.mutateAsync(changes).then(drop, drop);
  };

  const placed = (moves: ReadonlyMap<number, StagePoint>): Tracks => {
    const tracks: Tracks = {};
    for (const [spotId, point] of moves) {
      tracks[spotId] = formationPlacedOf(spotId, pathOf(spotId)?.keyframes ?? [], span, point);
    }
    edits.setTracks(tracks);
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

  const nextSelection = (spotId: number): readonly number[] => {
    if (multi) {
      return selected.includes(spotId)
        ? selected.filter((id) => id !== spotId)
        : [...selected, spotId];
    }
    return selected.includes(spotId) ? selected : [spotId];
  };

  const single =
    selected.length === 1
      ? spotTitleOf(
          studio.spots.find((spot) => spot.spotId === selected[0])?.number ?? 0,
          nameOf(studio.spots.find((spot) => spot.spotId === selected[0])),
        )
      : null;

  return {
    scene: { paths, spots: studio.spots, ownSpotId, stage },
    selected,
    multi,
    onion,
    onionPoints:
      !onion || previousSeconds === null || !formation
        ? []
        : paths.flatMap((path) => {
            const point = poseAt(path, previousSeconds)?.position ?? null;
            if (point === null) {
              return [];
            }
            const share = viewShareOf(point, stage);
            return [{ key: String(path.spotId), x: share.x, y: share.y }];
          }),
    formation,
    formationText: formationTextOf(stepIndex + 1, formationSeconds),
    selectionText: selectionTextOf(selected.length, single),
    sheetOpen,
    canMirror: selected.length > 0,
    canAlign: selected.length >= 2,
    canDistribute: selected.length >= 3,
    formationSeconds,
    previousSeconds,
    copySource,
    copySteps: steps.length,
    press: (spotId, share) => {
      const chosen = nextSelection(spotId);
      setSelected(chosen);
      if (!formation) {
        grab.current = null;
        return;
      }
      if (player.state().playing) {
        controls.toggle();
      }
      if (Math.abs(player.position() - formationSeconds) > AT_BORDER_SECONDS) {
        player.seek(formationSeconds);
      }
      grab.current = { start: share, origins: pointsOf(chosen), placed: null };
    },
    move: (share) => {
      const held = grab.current;
      if (held === null) {
        return;
      }
      const delta = { x: share.x - held.start.x, y: share.y - held.start.y };
      const moves = new Map<number, StagePoint>();
      for (const [id, origin] of held.origins) {
        moves.set(id, draggedPointOf(origin, delta, stage));
      }
      held.placed = placed(moves);
    },
    end: () => {
      const held = grab.current;
      grab.current = null;
      if (held !== null && held.placed !== null) {
        commit(held.placed);
      }
    },
    clear: () => {
      if (!multi) {
        setSelected([]);
      }
    },
    choose: (spotId) => {
      setSelected(nextSelection(spotId));
    },
    forget: (spotId) => {
      setSelected((chosen) => chosen.filter((id) => id !== spotId));
    },
    toggleMulti: () => {
      setMulti((on) => !on);
    },
    toggleOnion: () => {
      setOnion((on) => !on);
    },
    mirror: () => {
      rearranged((points) => points.map(mirroredOf));
    },
    align: (axis) => {
      rearranged((points) => alignedOf(points, axis, stage));
    },
    distribute: (axis) => {
      rearranged((points) => distributedOf(points, axis, stage));
    },
    preset: (kind) => {
      const points = presetPointsOf(kind, targets.length, stage);
      settle(
        new Map(
          targets.map((id, index) => [id, points[index] ?? { rightMetres: 0, backMetres: 0 }]),
        ),
      );
    },
    pickCopySource: (direction) => {
      setCopyPick(Math.min(steps.length - 1, Math.max(0, copySource + direction)));
    },
    copy: () => {
      const source = steps[copySource]?.startSeconds;
      if (source === null || source === undefined || copySource === stepIndex) {
        return;
      }
      const from = formationAt(paths, source);
      settle(
        new Map(
          targets.flatMap((id) => {
            const point = from.get(id);
            return point === undefined ? [] : [[id, point] as const];
          }),
        ),
      );
    },
    addSpot: () => {
      const place = (added: AddedSpot): void => {
        settle(new Map([[added.spotId, freePointOf([...current.values()], stage)]]));
        setSelected([added.spotId]);
      };
      void stageWrites.addSpot.mutateAsync(undefined).then(place, () => undefined);
    },
    openSheet: () => {
      setSheetOpen(true);
    },
    closeSheet: () => {
      setSheetOpen(false);
    },
  };
};

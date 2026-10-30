import { useRef, useState } from 'react';
import type { StagePoint } from '@/features/act-player/choreography-motion';
import { poseAt } from '@/features/act-player/choreography-motion';
import type { StageScene } from '@/features/act-practice/practice-stage';
import { viewShareOf } from '@/features/act-practice/practice-stage';
import type { StudioSpot } from '@/features/acts/schemas';
import { formationTextOf, selectionTextOf, spotTitleOf } from '../studio-h-copy';
import type { StageShare } from '../studio-h-edits';
import { draggedPointOf, placedTrackOf } from '../studio-h-edits';
import type { StudioH } from './use-studio-h';

const AT_BORDER_SECONDS = 0.02;

export interface StudioHOnionPoint {
  key: string;
  x: number;
  y: number;
}

export interface StudioHStage {
  scene: StageScene;
  selected: readonly number[];
  multi: boolean;
  onion: boolean;
  onionPoints: StudioHOnionPoint[];
  formation: boolean;
  formationText: string;
  selectionText: string;
  sheetOpen: boolean;
  canMirror: boolean;
  formationSeconds: number;
  press: (spotId: number, share: StageShare) => void;
  move: (share: StageShare) => void;
  end: () => void;
  clear: () => void;
  choose: (spotId: number) => void;
  toggleMulti: () => void;
  toggleOnion: () => void;
  mirror: () => void;
  openSheet: () => void;
  closeSheet: () => void;
}

interface Grab {
  start: StageShare;
  origins: ReadonlyMap<number, StagePoint>;
  moved: boolean;
}

const nameOf = (spot: StudioSpot | undefined): string | null => spot?.person?.firstName ?? null;

export const useStudioHStage = (h: StudioH): StudioHStage => {
  const { playback, practice, studio, edits, mode } = h;
  const { player, paths, stage, ownSpotId, steps, controls } = playback;
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [multi, setMulti] = useState(false);
  const [onion, setOnion] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const grab = useRef<Grab | null>(null);
  const formation = mode.tool === 'formation';
  const step = practice.step;
  const stepIndex = steps.findIndex((candidate) => candidate.stepId === step?.stepId);
  const formationSeconds = step?.startSeconds ?? 0;
  const previous = steps[stepIndex - 1] ?? null;
  const pathOf = (spotId: number) => paths.find((path) => path.spotId === spotId) ?? null;
  const pointAt = (spotId: number, seconds: number): StagePoint | null => {
    const path = pathOf(spotId);
    return path === null ? null : (poseAt(path, seconds)?.position ?? null);
  };

  const place = (moves: ReadonlyMap<number, StagePoint>): void => {
    const tracks: Record<number, ReturnType<typeof placedTrackOf>> = {};
    for (const [spotId, point] of moves) {
      const path = pathOf(spotId);
      if (path !== null) {
        tracks[spotId] = placedTrackOf(path.keyframes, formationSeconds, point);
      }
    }
    edits.setTracks(tracks);
  };

  const originsOf = (ids: readonly number[]): Map<number, StagePoint> => {
    const origins = new Map<number, StagePoint>();
    for (const id of ids) {
      const point = pointAt(id, formationSeconds);
      if (point !== null) {
        origins.set(id, point);
      }
    }
    return origins;
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
      !onion || previous === null || previous.startSeconds === null || !formation
        ? []
        : paths.flatMap((path) => {
            const point = pointAt(path.spotId, previous.startSeconds ?? 0);
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
    formationSeconds,
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
      grab.current = { start: share, origins: originsOf(chosen), moved: false };
    },
    move: (share) => {
      const held = grab.current;
      if (held === null) {
        return;
      }
      held.moved = true;
      const delta = { x: share.x - held.start.x, y: share.y - held.start.y };
      const moves = new Map<number, StagePoint>();
      for (const [id, origin] of held.origins) {
        moves.set(id, draggedPointOf(origin, delta, stage));
      }
      place(moves);
    },
    end: () => {
      grab.current = null;
    },
    clear: () => {
      if (!multi) {
        setSelected([]);
      }
    },
    choose: (spotId) => {
      setSelected(nextSelection(spotId));
    },
    toggleMulti: () => {
      setMulti((on) => !on);
    },
    toggleOnion: () => {
      setOnion((on) => !on);
    },
    mirror: () => {
      const moves = new Map<number, StagePoint>();
      for (const [id, origin] of originsOf(selected)) {
        moves.set(id, { rightMetres: -origin.rightMetres, backMetres: origin.backMetres });
      }
      place(moves);
    },
    openSheet: () => {
      setSheetOpen(true);
    },
    closeSheet: () => {
      setSheetOpen(false);
    },
  };
};

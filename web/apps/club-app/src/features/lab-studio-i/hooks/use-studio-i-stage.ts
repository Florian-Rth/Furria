import type {
  KkStudioIShare,
  KkStudioIStageDotKind,
  KkStudioIStageGhost,
  KkStudioIStagePath,
} from '@furria/ui/KkStudioIStage';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio, StudioStage } from '@/features/acts/schemas';
import { dotLabelOf } from '../studio-i-copy';
import type { SpotMove } from '../studio-i-formation';
import { routeOf, shareOfPoint, stagePointOfShare } from '../studio-i-formation';
import { dotKindOf, movesOfStep } from '../studio-i-scene';
import type { StudioIDrafts } from './use-studio-i-drafts';
import type { StudioIEdit } from './use-studio-i-edit';

export interface StageDotView {
  spotId: number;
  number: number;
  kind: KkStudioIStageDotKind;
  x: number;
  y: number;
  selected: boolean;
  moved: boolean;
  label: string;
  press: () => void;
  drag: (share: KkStudioIShare) => void;
}

export interface StageLiveTrack {
  path: SpotPath;
  move: SpotMove;
}

export interface StudioIStageView {
  stage: StudioStage;
  aspect: number;
  ghosts: KkStudioIStageGhost[];
  paths: KkStudioIStagePath[];
  dots: StageDotView[];
  live: StageLiveTrack[];
  clear: () => void;
}

const EMPTY_STAGE: Omit<StudioIStageView, 'stage' | 'aspect' | 'clear'> = {
  ghosts: [],
  paths: [],
  dots: [],
  live: [],
};

export const useStudioIStage = (
  studio: Studio,
  playback: StudioPlayback,
  drafts: StudioIDrafts,
  edit: StudioIEdit,
): StudioIStageView => {
  const { paths, stage, ownSpotId } = playback;
  const span = edit.span;
  const base = { stage, aspect: stage.depthMetres / stage.widthMetres, clear: edit.clearSelection };

  if (span === null) {
    return { ...base, ...EMPTY_STAGE };
  }

  const scene = { paths, spots: studio.spots, ownSpotId, stage };
  const moves = movesOfStep(scene, span, drafts.formation);
  const selectedId = edit.selection?.kind === 'dot' ? edit.selection.spotId : null;
  const pathOf = (spotId: number): SpotPath | undefined =>
    paths.find((path) => path.spotId === spotId);

  return {
    ...base,
    ghosts: moves
      .filter((move) => move.window !== null)
      .map((move) => ({ key: String(move.spotId), ...shareOfPoint(move.from, stage) })),
    paths: moves.flatMap((move) => {
      const path = pathOf(move.spotId);
      return path === undefined || move.window === null
        ? []
        : [
            {
              key: String(move.spotId),
              points: routeOf(path, move).map((point) => shareOfPoint(point, stage)),
              selected: move.spotId === selectedId,
            },
          ];
    }),
    dots: moves.map((move) => {
      const spot = studio.spots.find((candidate) => candidate.spotId === move.spotId);
      const share = shareOfPoint(move.to, stage);
      const number = spot?.number ?? 0;
      return {
        spotId: move.spotId,
        number,
        kind: dotKindOf(spot, ownSpotId),
        x: share.x,
        y: share.y,
        selected: move.spotId === selectedId,
        moved: move.drafted,
        label: dotLabelOf(number, spot?.person?.firstName ?? null),
        press: () => {
          edit.select({ kind: 'dot', spotId: move.spotId });
        },
        drag: (to) => {
          drafts.place(span.stepId, move.spotId, stagePointOfShare(to, stage));
        },
      };
    }),
    live: moves.flatMap((move) => {
      const path = pathOf(move.spotId);
      return path === undefined || move.window === null ? [] : [{ path, move }];
    }),
  };
};

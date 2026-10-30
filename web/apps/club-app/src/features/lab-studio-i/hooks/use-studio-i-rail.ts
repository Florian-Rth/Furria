import type { KkPracticeStepsThumbDot } from '@furria/ui/KkPracticeSteps';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { partOfStep } from '@/features/act-player/music-timeline';
import type { Studio } from '@/features/acts/schemas';
import {
  countsText,
  groupMetaOf,
  musicTileMetaOf,
  STUDIO_I_MUSIC_PAGE,
  STUDIO_I_NO_PART,
  tileLabelOf,
} from '../studio-i-copy';
import { shareOfPoint } from '../studio-i-formation';
import { MUSIC_PAGE } from '../studio-i-model';
import { dotKindOf, movesOfStep } from '../studio-i-scene';
import { countsIn } from '../studio-i-spans';
import type { StudioIDrafts } from './use-studio-i-drafts';
import type { StudioIEdit } from './use-studio-i-edit';

export interface RailTileView {
  stepId: number;
  number: number;
  name: string;
  meta: string;
  current: boolean;
  label: string;
  dots: KkPracticeStepsThumbDot[];
  press: () => void;
}

export interface RailGroupView {
  key: string;
  name: string;
  meta: string;
  tiles: RailTileView[];
}

export interface RailLeadView {
  name: string;
  meta: string;
  current: boolean;
  press: () => void;
}

export interface StudioIRail {
  aspect: number;
  lead: RailLeadView;
  groups: RailGroupView[];
}

export const useStudioIRail = (
  studio: Studio,
  playback: StudioPlayback,
  drafts: StudioIDrafts,
  edit: StudioIEdit,
): StudioIRail => {
  const { paths, stage, ownSpotId, parts, countMarks } = playback;
  const scene = { paths, spots: studio.spots, ownSpotId, stage };
  const groups: RailGroupView[] = [];

  drafts.spans.forEach((span, index) => {
    const part = partOfStep(parts, span.stepId);
    const key = part === null ? `step-${span.stepId}` : `part-${part.partId}`;
    const original = studio.steps.find((step) => step.stepId === span.stepId);
    const name = drafts.names.get(span.stepId) ?? original?.name ?? '';
    const tile: RailTileView = {
      stepId: span.stepId,
      number: index + 1,
      name,
      meta: countsText(countsIn(countMarks, span)),
      current: edit.page.kind === 'step' && edit.page.stepId === span.stepId,
      label: tileLabelOf(index + 1, name),
      dots: movesOfStep(scene, span, drafts.formation).map((move) => {
        const share = shareOfPoint(move.to, stage);
        const spot = studio.spots.find((candidate) => candidate.spotId === move.spotId);
        return {
          key: String(move.spotId),
          x: share.x,
          y: share.y,
          kind: dotKindOf(spot, ownSpotId),
        };
      }),
      press: () => {
        edit.openPage({ kind: 'step', stepId: span.stepId });
      },
    };
    const last = groups.at(-1);

    if (last !== undefined && last.key === key) {
      last.tiles.push(tile);
      last.meta = groupMetaOf(last.tiles.length);
    } else {
      groups.push({
        key,
        name: part?.name ?? STUDIO_I_NO_PART,
        meta: groupMetaOf(1),
        tiles: [tile],
      });
    }
  });

  return {
    aspect: stage.depthMetres / stage.widthMetres,
    lead: {
      name: STUDIO_I_MUSIC_PAGE,
      meta: musicTileMetaOf(studio.songs.length, studio.spots.length),
      current: edit.page.kind === 'music',
      press: () => {
        edit.openPage(MUSIC_PAGE);
      },
    },
    groups,
  };
};

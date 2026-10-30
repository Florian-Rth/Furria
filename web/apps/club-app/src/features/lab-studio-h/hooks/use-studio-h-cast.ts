import { poseAt } from '@/features/act-player/choreography-motion';
import { dotLabelOf, STUDIO_H_OPEN_SPOT, STUDIO_H_SELECTED, spotMetaOf } from '../studio-h-copy';
import type { StudioH } from './use-studio-h';
import type { StudioHStage } from './use-studio-h-stage';

export interface StudioHCastRow {
  key: string;
  lead: string;
  title: string;
  meta: string;
  badge: string | null;
  selected: boolean;
  label: string;
  press: () => void;
}

export const useStudioHCast = (h: StudioH, editor: StudioHStage): StudioHCastRow[] => {
  const { studio, playback } = h;

  return [...studio.spots]
    .sort((left, right) => left.number - right.number)
    .map((spot) => {
      const path = playback.paths.find((candidate) => candidate.spotId === spot.spotId) ?? null;
      const pose = path === null ? null : poseAt(path, editor.formationSeconds);
      const name = spot.person === null ? null : `${spot.person.firstName} ${spot.person.lastName}`;
      const selected = editor.selected.includes(spot.spotId);

      return {
        key: String(spot.spotId),
        lead: String(spot.number),
        title: name ?? STUDIO_H_OPEN_SPOT,
        meta:
          pose === null
            ? STUDIO_H_OPEN_SPOT
            : spotMetaOf(
                pose.position.rightMetres,
                pose.position.backMetres,
                path?.keyframes.length ?? 0,
              ),
        badge: selected ? STUDIO_H_SELECTED : null,
        selected,
        label: dotLabelOf(spot.number, name),
        press: () => {
          editor.choose(spot.spotId);
        },
      };
    });
};

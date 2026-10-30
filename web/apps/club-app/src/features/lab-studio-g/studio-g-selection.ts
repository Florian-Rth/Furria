export type StudioGSelection =
  | { kind: 'none' }
  | { kind: 'song'; mediaItemId: number }
  | { kind: 'part'; partId: number }
  | { kind: 'step'; stepId: number }
  | { kind: 'video'; videoId: number }
  | { kind: 'spots'; spotIds: readonly number[] }
  | { kind: 'keyframe'; seconds: number; spotIds: readonly number[] };

export type StudioGSelectionKind = StudioGSelection['kind'];

export interface ShareBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface SharePoint {
  spotId: number;
  x: number;
  y: number;
}

export const NO_SELECTION: StudioGSelection = { kind: 'none' };

export const selectedSpotIdsOf = (selection: StudioGSelection): readonly number[] =>
  selection.kind === 'spots' || selection.kind === 'keyframe' ? selection.spotIds : [];

export const pressedSpotsOf = (
  selection: StudioGSelection,
  spotId: number,
  additive: boolean,
): StudioGSelection => {
  const current = selectedSpotIdsOf(selection);

  if (!additive) {
    return { kind: 'spots', spotIds: [spotId] };
  }

  const spotIds = current.includes(spotId)
    ? current.filter((id) => id !== spotId)
    : [...current, spotId].sort((left, right) => left - right);

  return spotIds.length === 0 ? NO_SELECTION : { kind: 'spots', spotIds };
};

export const spotsInBoxOf = (points: readonly SharePoint[], box: ShareBox): number[] =>
  points
    .filter(
      (point) =>
        point.x >= Math.min(box.left, box.right) &&
        point.x <= Math.max(box.left, box.right) &&
        point.y >= Math.min(box.top, box.bottom) &&
        point.y <= Math.max(box.top, box.bottom),
    )
    .map((point) => point.spotId)
    .sort((left, right) => left - right);

export const boxedSelectionOf = (spotIds: readonly number[]): StudioGSelection =>
  spotIds.length === 0 ? NO_SELECTION : { kind: 'spots', spotIds };

export const isSameSelection = (left: StudioGSelection, right: StudioGSelection): boolean =>
  JSON.stringify(left) === JSON.stringify(right);

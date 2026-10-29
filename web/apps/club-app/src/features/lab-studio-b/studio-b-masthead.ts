import type { ActStudioResponse, Studio } from '@/features/acts/schemas';
import { sessionYearsLabelOf } from '@/lib/club';
import { ownSpotLineOf, spotsLineOf, stepsCountOf } from './studio-b-copy';
import type { Manual } from './studio-b-manual';

export interface StudioBMasthead {
  facts: string[];
  own: string | null;
}

export const mastheadOf = (
  act: ActStudioResponse['act'],
  studio: Studio,
  manual: Manual,
  ownSpotId: number | null,
): StudioBMasthead => {
  const ownSpot = studio.spots.find((spot) => spot.spotId === ownSpotId) ?? null;
  const openSpots = studio.spots.filter((spot) => spot.person === null).length;
  const facts = [
    act.group?.name ?? null,
    act.sessionYear === null ? null : sessionYearsLabelOf(act.sessionYear),
    manual.stepCount > 0 ? stepsCountOf(manual.stepCount) : null,
    studio.spots.length > 0 ? spotsLineOf(studio.spots.length, openSpots) : null,
  ].filter((fact) => fact !== null);

  return { facts, own: ownSpot === null ? null : ownSpotLineOf(ownSpot.number) };
};

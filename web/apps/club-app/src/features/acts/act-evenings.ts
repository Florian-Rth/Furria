import type { EveningChoreographyState } from '@/features/act-studio/studio-evening';
import { eveningChangesOf, eveningChoreographyStateOf } from '@/features/act-studio/studio-evening';
import type { EveningChange } from '@/features/running-order/schemas';
import type { PortraitPersonRef } from '@/lib/api/schemas';
import type { CastTile } from './act-cast';
import { castTilesOf } from './act-cast';
import type { Choreography, StudioEvening } from './schemas';

export type EveningEntryState = 'open' | 'joined' | 'placed';

export interface EveningEntry {
  evening: StudioEvening;
  state: EveningEntryState;
  changes: EveningChange[];
  choreography: EveningChoreographyState;
}

export interface EveningDancerToggle {
  person: PortraitPersonRef;
  dances: boolean;
}

export const eveningStateOf = (evening: StudioEvening): EveningEntryState => {
  if (evening.appearance === null) {
    return 'open';
  }

  return evening.appearance.position === null ? 'joined' : 'placed';
};

export const eveningEntryOf = (
  evening: StudioEvening,
  session: Choreography | null,
): EveningEntry => ({
  evening,
  state: eveningStateOf(evening),
  changes: eveningChangesOf(evening.appearance),
  choreography: eveningChoreographyStateOf(evening.appearance, session),
});

export const eveningTilesOf = (
  sessionCast: readonly PortraitPersonRef[],
  evening: StudioEvening,
): CastTile[] =>
  castTilesOf(
    sessionCast,
    {
      removedIds: evening.appearance?.removedPersonIds ?? [],
      added: evening.appearance?.added ?? [],
    },
    true,
  );

export const dancerToggleOf = (tile: CastTile): EveningDancerToggle => ({
  person: tile.person,
  dances: tile.state === 'out',
});

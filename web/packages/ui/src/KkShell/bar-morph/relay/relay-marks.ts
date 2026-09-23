import type { RelayArrival, RelayDeparture } from './relay-dom';
import { pieceOf } from './relay-dom';
import type { RelayOffset } from './relay-flight';
import {
  markCatchAt,
  markDropInAt,
  markShoulderInAt,
  markSlideOutAt,
  markTumbleAt,
  markWiggleAt,
} from './relay-flight';
import type { RelayGhost } from './relay-ghosts';
import { ghostOf, placeAtRest } from './relay-ghosts';
import type { RelayMarkEntry, RelayMarkExit } from './relay-plan';
import { markRolesOf } from './relay-plan';

type RelayOffsetAt = (progress: number) => RelayOffset;

const EXITS: Record<Exclude<RelayMarkExit, 'none'>, RelayOffsetAt> = {
  tumble: markTumbleAt,
  slide: markSlideOutAt,
};

const ENTRIES: Record<Exclude<RelayMarkEntry, 'none'>, RelayOffsetAt> = {
  drop: markDropInAt,
  shoulder: markShoulderInAt,
  wiggle: markWiggleAt,
  catch: markCatchAt,
};

interface RelayMarkPart {
  ghost: RelayGhost;
  offsetAt: RelayOffsetAt;
}

export const markChoreographyOf = (
  layer: HTMLElement,
  departure: RelayDeparture,
  arrival: RelayArrival,
): ((progress: number) => void) => {
  const roles = markRolesOf(departure.markKind, arrival.markKind);
  const parts: RelayMarkPart[] = [];

  if (roles.exit !== 'none' && departure.mark !== null) {
    parts.push({ ghost: ghostOf(layer, departure.mark, 'mark'), offsetAt: EXITS[roles.exit] });
  }

  if (roles.entry !== 'none' && arrival.mark !== null) {
    parts.push({
      ghost: ghostOf(layer, pieceOf(arrival.mark), 'mark'),
      offsetAt: ENTRIES[roles.entry],
    });
  }

  return (progress: number): void => {
    for (const part of parts) {
      placeAtRest(part.ghost, part.offsetAt(progress));
    }
  };
};

import { toImageSource } from '@furria/ui/image-source';
import type { KkCastTile } from '@furria/ui/KkCastGrid';
import type { PortraitPersonRef } from '@/lib/api/schemas';
import { toInitials } from '@/lib/initials';
import { toShortName, toTileStateLabel } from './acts-copy';

const COLLATOR = new Intl.Collator('de-DE');

const byName = (left: PortraitPersonRef, right: PortraitPersonRef): number =>
  COLLATOR.compare(left.firstName, right.firstName) ||
  COLLATOR.compare(left.lastName, right.lastName);

export const readOnlyCastTilesOf = (people: readonly PortraitPersonRef[] | null): KkCastTile[] =>
  [...(people ?? [])].sort(byName).map((person) => ({
    id: person.personId,
    name: toShortName(person.firstName, person.lastName),
    initials: toInitials(person.firstName, person.lastName),
    portrait: toImageSource(person.portrait, 'portrait'),
    state: 'in',
    badge: null,
    stateLabel: toTileStateLabel('in'),
  }));

import type { KkImageSource, KkStanding } from '@furria/ui';
import { toImageSource } from '@furria/ui';
import { useMeQuery } from '@/features/session';
import { sessionAt } from '@/lib/club';
import { toStanding } from '@/lib/honours';
import { toInitials } from '@/lib/initials';
import { toPersonName } from '../manage-persons-labels';
import { toArchiveNote } from '../person-archive';
import { runningFeeReductionOf, toBirthLine } from '../person-identity';
import type { PersonDetails } from '../schemas';

export interface PersonIdentity {
  name: string;
  initials: string;
  portrait: KkImageSource | null;
  birthLine: string | null;
  archiveNote: string | null;
  standing: KkStanding;
}

export const usePersonIdentity = (person: PersonDetails): PersonIdentity => {
  const me = useMeQuery();
  const today = new Date();
  const reduction = runningFeeReductionOf(person.feeReductions, sessionAt(today).startYear);

  return {
    name: toPersonName(person),
    initials: toInitials(person.firstName, person.lastName),
    portrait: toImageSource(person.portrait?.picture ?? null, 'portrait'),
    birthLine: toBirthLine(person.birthDate, person.city, today),
    archiveNote: toArchiveNote(person.archive, me.data?.person?.id ?? null, today),
    standing: toStanding({
      membershipState: person.membershipState,
      accessState: person.access.state,
      feeReduced: reduction !== null,
    }),
  };
};

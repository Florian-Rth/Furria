import { toImageSource } from '@furria/ui/image-source';
import type { KkPassCastPerson } from '@furria/ui/KkPassCard';
import { KkPassCard } from '@furria/ui/KkPassCard';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import type { PassCastMember, PassCastRole } from '../pass-act';
import { CAST_EMPTY, OWN_LABEL, toCastCount, toCastRoleLabel } from '../pass-copy';

interface PassCardCastProps {
  cast: readonly PassCastMember[];
  role: PassCastRole;
  compact: boolean;
}

const toCastPerson = ({ person, own }: PassCastMember): KkPassCastPerson => ({
  id: person.personId,
  name: person.firstName,
  initials: toInitials(person.firstName, person.lastName),
  portrait: toImageSource(person.portrait, 'portrait'),
  own,
});

export const PassCardCast: FC<PassCardCastProps> = ({ cast, role, compact }) => (
  <KkPassCard.Cast
    label={toCastRoleLabel(role)}
    count={toCastCount(cast.length)}
    people={cast.map(toCastPerson)}
    ownLabel={OWN_LABEL}
    emptyLabel={CAST_EMPTY}
    compact={compact}
  />
);

import { toImageSource } from '@furria/ui/image-source';
import { KkAvatar } from '@furria/ui/KkAvatar';
import { KkFacetList } from '@furria/ui/KkFacetList';
import { KkMeta } from '@furria/ui/KkMeta';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { NONE, toCastRoleMeta } from '../act-card-copy';
import type { ActCardView } from '../act-card-view';
import { castRowsOf } from '../cast-rows';

interface ActCardCastListProps {
  view: ActCardView;
  label: string;
}

export const ActCardCastList: FC<ActCardCastListProps> = ({ view, label }) => {
  if (view.cast.length === 0) {
    return <KkMeta>{NONE}</KkMeta>;
  }

  const rows = castRowsOf(view.cast, view.editors, view.viewerId).map(({ person, role }) => {
    const initials = toInitials(person.firstName, person.lastName);
    const image = toImageSource(person.portrait, 'portrait');
    const meta = toCastRoleMeta(role);
    const face = <KkAvatar size="small" initials={initials} image={image} />;
    const name = `${person.firstName} ${person.lastName}`;

    return <KkFacetList.Row key={person.personId} face={face} title={name} meta={meta} />;
  });

  return <KkFacetList label={label}>{rows}</KkFacetList>;
};

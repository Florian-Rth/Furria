import { toImageSource } from '@furria/ui/image-source';
import { KkAvatar } from '@furria/ui/KkAvatar';
import { KkFacetList } from '@furria/ui/KkFacetList';
import { KkMeta } from '@furria/ui/KkMeta';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { NONE, toCastRoleMeta } from '../act-c-copy';
import type { ActCView } from '../act-c-view';
import { castRowsOf } from '../cast-rows';

interface ActCCastListProps {
  view: ActCView;
  label: string;
}

export const ActCCastList: FC<ActCCastListProps> = ({ view, label }) => {
  if (view.cast.length === 0) {
    return <KkMeta>{NONE}</KkMeta>;
  }

  const rows = castRowsOf(view.cast, view.editors, view.viewerId).map(({ person, role }) => {
    const face = (
      <KkAvatar
        size="small"
        initials={toInitials(person.firstName, person.lastName)}
        image={toImageSource(person.portrait, 'portrait')}
      />
    );
    const name = `${person.firstName} ${person.lastName}`;

    return (
      <KkFacetList.Row key={person.personId} face={face} title={name} meta={toCastRoleMeta(role)} />
    );
  });

  return <KkFacetList label={label}>{rows}</KkFacetList>;
};

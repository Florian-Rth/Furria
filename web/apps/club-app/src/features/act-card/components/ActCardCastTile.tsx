import { toImageSource } from '@furria/ui/image-source';
import { KkAvatarStack } from '@furria/ui/KkAvatarStack';
import { KkFacetTile } from '@furria/ui/KkFacetTile';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { NONE, toDoorHint, toNamesLine, toPeopleCount } from '../act-card-copy';
import { namesPreviewOf } from '../act-card-model';
import type { ActCardView } from '../act-card-view';

const FACES = 4;
const NAMES = 4;

interface ActCardCastTileProps {
  view: ActCardView;
  label: string;
  order: number;
  current: boolean;
  onOpen: () => void;
}

export const ActCardCastTile: FC<ActCardCastTileProps> = ({
  view,
  label,
  order,
  current,
  onOpen,
}) => {
  const initials = view.cast.map((person) => toInitials(person.firstName, person.lastName));
  const portraits = view.cast.map((person) => toImageSource(person.portrait, 'portrait'));
  const count = view.cast.length;
  const faces =
    count === 0 ? null : (
      <KkAvatarStack initials={initials} portraits={portraits} max={FACES} total={count} />
    );
  const names = count === 0 ? NONE : toNamesLine(namesPreviewOf(view.cast, NAMES));
  const people = view.cast.map((person) => ({
    key: person.personId,
    name: `${person.firstName} ${person.lastName}`,
  }));
  const hint = toDoorHint('cast');
  const figure = String(count);
  const aside = toPeopleCount(count);

  return (
    <KkFacetTile label={label} order={order} current={current}>
      <KkFacetTile.Door icon="group" label={label} hint={hint} onOpen={onOpen} />
      <KkFacetTile.Figure value={figure} aside={aside} />
      <KkFacetTile.Line lines={2}>{names}</KkFacetTile.Line>
      <KkFacetTile.Names label={label} people={people} />
      <KkFacetTile.Foot>{faces}</KkFacetTile.Foot>
    </KkFacetTile>
  );
};

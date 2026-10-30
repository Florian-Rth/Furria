import { toImageSource } from '@furria/ui/image-source';
import { KkAvatarStack } from '@furria/ui/KkAvatarStack';
import { KkFacetTile } from '@furria/ui/KkFacetTile';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { NONE, toDoorHint, toNamesLine, toPeopleCount } from '../act-c-copy';
import { namesPreviewOf } from '../act-c-model';
import type { ActCView } from '../act-c-view';

const FACES = 4;
const NAMES = 4;

interface ActCCastTileProps {
  view: ActCView;
  label: string;
  order: number;
  current: boolean;
  onOpen: () => void;
}

export const ActCCastTile: FC<ActCCastTileProps> = ({ view, label, order, current, onOpen }) => {
  const initials = view.cast.map((person) => toInitials(person.firstName, person.lastName));
  const portraits = view.cast.map((person) => toImageSource(person.portrait, 'portrait'));
  const count = view.cast.length;
  const faces =
    count === 0 ? null : (
      <KkAvatarStack initials={initials} portraits={portraits} max={FACES} total={count} />
    );
  const names = count === 0 ? NONE : toNamesLine(namesPreviewOf(view.cast, NAMES));

  return (
    <KkFacetTile label={label} order={order} current={current}>
      <KkFacetTile.Door icon="group" label={label} hint={toDoorHint('cast')} onOpen={onOpen} />
      <KkFacetTile.Figure value={String(count)} aside={toPeopleCount(count)} />
      <KkFacetTile.Line lines={2}>{names}</KkFacetTile.Line>
      <KkFacetTile.Foot>{faces}</KkFacetTile.Foot>
    </KkFacetTile>
  );
};

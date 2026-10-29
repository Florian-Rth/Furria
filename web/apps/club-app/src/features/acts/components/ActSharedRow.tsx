import { toImageSource } from '@furria/ui/image-source';
import { KkAvatarStack } from '@furria/ui/KkAvatarStack';
import { KkPictureMark } from '@furria/ui/KkPictureMark';
import { KkSpotlightList } from '@furria/ui/KkSpotlightList';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { KIND_ICONS, toSharedActMeta } from '../acts-copy';
import type { SharedAct } from '../acts-overlap';

const FACES = 6;

interface ActSharedRowProps {
  shared: SharedAct;
}

export const ActSharedRow: FC<ActSharedRowProps> = ({ shared }) => {
  const { act, people } = shared;
  const initials = people.map((person) => toInitials(person.firstName, person.lastName));
  const portraits = people.map((person) => toImageSource(person.portrait, 'portrait'));
  const mark = (
    <KkPictureMark
      image={null}
      tone={act.group?.tone ?? null}
      clubIcon={null}
      icon={KIND_ICONS[act.kind ?? 'point']}
      alt={act.name}
    />
  );
  const meta = <span data-kk-fact>{toSharedActMeta(people.length)}</span>;
  const faces = <KkAvatarStack initials={initials} portraits={portraits} max={FACES} />;

  return (
    <KkSpotlightList.Row
      rowKey={String(act.actId)}
      mark={mark}
      title={act.name}
      fact={meta}
      chips={faces}
    />
  );
};

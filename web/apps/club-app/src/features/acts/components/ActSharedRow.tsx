import { toImageSource } from '@furria/ui/image-source';
import type { KkFaceToggle } from '@furria/ui/KkFaceToggles';
import { KkFaceToggles } from '@furria/ui/KkFaceToggles';
import { KkPictureMark } from '@furria/ui/KkPictureMark';
import { KkSpotlightList } from '@furria/ui/KkSpotlightList';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { KIND_ICONS, SPOTLIGHT_PRESS_LABEL, toSharedActMeta, toShortName } from '../acts-copy';
import type { SharedAct } from '../acts-overlap';
import { spotlightOf } from '../acts-overlap';

interface ActSharedRowProps {
  shared: SharedAct;
  spotlightId: number | null;
  onToggleSpotlight: (personId: number) => void;
}

export const ActSharedRow: FC<ActSharedRowProps> = ({ shared, spotlightId, onToggleSpotlight }) => {
  const { act, people } = shared;
  const faces: KkFaceToggle[] = people.map((person) => ({
    id: person.personId,
    name: toShortName(person.firstName, person.lastName),
    initials: toInitials(person.firstName, person.lastName),
    portrait: toImageSource(person.portrait, 'portrait'),
  }));
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
  const toggles = (
    <KkFaceToggles
      label={act.name}
      faces={faces}
      selectedId={spotlightId}
      pressLabel={SPOTLIGHT_PRESS_LABEL}
      onToggle={onToggleSpotlight}
    />
  );

  return (
    <KkSpotlightList.Row
      rowKey={String(act.actId)}
      mark={mark}
      title={act.name}
      fact={meta}
      chips={toggles}
      spotlight={spotlightOf(act, spotlightId)}
    />
  );
};

import { toImageSource } from '@furria/ui/image-source';
import { KkAvatar } from '@furria/ui/KkAvatar';
import { KkNumberedList } from '@furria/ui/KkNumberedList';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { PERSON_OPEN_LABEL, toPersonFact } from '../planner-copy';
import type { PersonTimeline } from '../planner-person';

interface PlannerPersonHeadProps {
  timeline: PersonTimeline;
}

export const PlannerPersonHead: FC<PlannerPersonHeadProps> = ({ timeline }) => {
  const { person } = timeline;
  const name = `${person.firstName} ${person.lastName}`;
  const avatar = (
    <KkAvatar
      initials={toInitials(person.firstName, person.lastName)}
      image={toImageSource(person.portrait, 'portrait')}
    />
  );

  return (
    <KkNumberedList label={name}>
      <KkNumberedList.Row
        rowKey={`person:${person.personId}`}
        mark={avatar}
        title={name}
        fact={<span>{toPersonFact(timeline)}</span>}
        arrive={false}
        openLabel={PERSON_OPEN_LABEL}
      />
    </KkNumberedList>
  );
};

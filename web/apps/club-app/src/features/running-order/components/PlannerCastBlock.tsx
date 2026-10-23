import { toImageSource } from '@furria/ui/image-source';
import type { KkCastFace } from '@furria/ui/KkCastFaces';
import { KkCastFaces } from '@furria/ui/KkCastFaces';
import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';
import type { DraftLine } from '@/features/running-order/types';
import { toInitials } from '@/lib/initials';
import { usePlanner } from '../planner-context';
import {
  ABSENT_LABEL,
  CAST_EMPTY,
  CAST_TITLE,
  FACT_SEPARATOR,
  PERSON_OPEN_LABEL,
  toCastFact,
} from '../planner-copy';
import { PlannerDetailSection } from './PlannerDetailSection';

interface PlannerCastBlockProps {
  line: DraftLine;
}

export const PlannerCastBlock: FC<PlannerCastBlockProps> = ({ line }) => {
  const planner = usePlanner();
  const cast = line.act.cast;
  const people: KkCastFace[] = [...cast]
    .sort((left, right) => Number(left.absent) - Number(right.absent))
    .map((person) => ({
      id: person.personId,
      name: person.firstName,
      initials: toInitials(person.firstName, person.lastName),
      portrait: toImageSource(person.portrait, 'portrait'),
      absent: person.absent,
    }));
  const absent = cast.filter((person) => person.absent).length;
  const title =
    cast.length === 0
      ? CAST_TITLE
      : `${CAST_TITLE}${FACT_SEPARATOR}${toCastFact(cast.length - absent, absent)}`;
  const content =
    people.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {CAST_EMPTY}
      </KkText>
    ) : (
      <KkCastFaces
        label={CAST_TITLE}
        people={people}
        absentLabel={ABSENT_LABEL}
        openLabel={PERSON_OPEN_LABEL}
        onOpen={planner.openPerson}
      />
    );

  return <PlannerDetailSection title={title}>{content}</PlannerDetailSection>;
};

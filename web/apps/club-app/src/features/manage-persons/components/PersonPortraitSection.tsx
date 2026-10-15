import type { FC } from 'react';
import { PictureSection, usePictureSection } from '@/features/pictures';
import { toInitials } from '@/lib/initials';
import { usePersonQuery } from '../api';
import { toPersonName } from '../manage-persons-labels';
import type { PersonDetails } from '../schemas';

interface PersonPortraitSectionProps {
  person: PersonDetails;
}

export const PersonPortraitSection: FC<PersonPortraitSectionProps> = ({ person }) => {
  const query = usePersonQuery(person.personId);
  const desk = usePictureSection({
    target: { kind: 'portrait', ownerId: person.personId },
    editing: person.portrait,
    refresh: query.refetch,
  });
  const initials = toInitials(person.firstName, person.lastName);

  return <PictureSection desk={desk} placeholderLabel={initials} alt={toPersonName(person)} />;
};

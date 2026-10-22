import type { FC } from 'react';
import { PictureSection } from '@/features/pictures/components/PictureSection';
import { usePictureSection } from '@/features/pictures/hooks/use-picture-section';
import { usePersonalMe } from '@/features/session/hooks/use-personal-me';
import type { MePerson } from '@/lib/api/schemas';
import { toInitials } from '@/lib/initials';

interface ProfilePortraitSectionProps {
  person: MePerson;
}

export const ProfilePortraitSection: FC<ProfilePortraitSectionProps> = ({ person }) => {
  const me = usePersonalMe();
  const desk = usePictureSection({
    target: { kind: 'portrait', ownerId: person.id },
    editing: person.portrait,
    refresh: me.refetch,
  });
  const initials = toInitials(person.firstName, person.lastName);
  const name = `${person.firstName} ${person.lastName}`;

  return <PictureSection desk={desk} placeholderLabel={initials} alt={name} />;
};

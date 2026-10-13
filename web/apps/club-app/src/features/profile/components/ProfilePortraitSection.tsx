import { KkPhoto } from '@furria/ui';
import type { FC } from 'react';
import { PictureSection, usePictureSection } from '@/features/pictures';
import { usePersonalMe } from '@/features/session';
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
  const poster = <KkPhoto alt="" placeholderLabel={initials} fill />;
  const name = `${person.firstName} ${person.lastName}`;

  return <PictureSection desk={desk} poster={poster} alt={name} />;
};

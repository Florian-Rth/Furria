import { KkAvatar } from '@furria/ui/KkAvatar';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import type { FC } from 'react';
import { usePersonIdentity } from '../hooks/use-person-identity';
import type { PersonDetails } from '../schemas';

interface PersonEditHeaderProps {
  person: PersonDetails;
}

export const PersonEditHeader: FC<PersonEditHeaderProps> = ({ person }) => {
  const identity = usePersonIdentity(person);

  const birthMeta = identity.birthLine === null ? null : <KkMeta>{identity.birthLine}</KkMeta>;
  const archiveMeta =
    identity.archiveNote === null ? null : <KkMeta>{identity.archiveNote}</KkMeta>;

  return (
    <KkScreenHeader>
      <KkScreenHeader.Visual>
        <KkAvatar
          initials={identity.initials}
          image={identity.portrait}
          size="header"
          standing={identity.standing}
          arrival
        />
      </KkScreenHeader.Visual>
      <KkScreenHeader.Text>
        <KkScreenHeader.Title transform="none">{identity.name}</KkScreenHeader.Title>
        {birthMeta}
        {archiveMeta}
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};

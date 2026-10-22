import type { KkHonours } from '@furria/ui/honour-types';
import type { KkImageSource } from '@furria/ui/image-source';
import { KkAvatar } from '@furria/ui/KkAvatar';
import { KkButton } from '@furria/ui/KkButton';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { PERSON_SCREEN_OPEN_LABEL } from '../group-hub-labels';

const MEMBER_PATH = '/members/$personId';

interface HubPersonHeaderProps {
  groupName: string;
  name: string;
  initials: string;
  portrait: KkImageSource | null;
  honours: KkHonours | undefined;
  personId: number;
  canOpenProfile: boolean;
}

export const HubPersonHeader: FC<HubPersonHeaderProps> = ({
  groupName,
  name,
  initials,
  portrait,
  honours,
  personId,
  canOpenProfile,
}) => {
  const openProfile = canOpenProfile ? (
    <KkScreenHeader.Meta>
      <KkButton
        variant="text"
        size="small"
        component={Link}
        to={MEMBER_PATH}
        params={{ personId: String(personId) }}
      >
        {PERSON_SCREEN_OPEN_LABEL}
      </KkButton>
    </KkScreenHeader.Meta>
  ) : null;

  return (
    <KkScreenHeader>
      <KkScreenHeader.Visual>
        <KkAvatar initials={initials} image={portrait} size="header" honours={honours} />
      </KkScreenHeader.Visual>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{groupName}</KkEyebrow>
        <KkScreenHeader.Title transform="none">{name}</KkScreenHeader.Title>
        {openProfile}
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};

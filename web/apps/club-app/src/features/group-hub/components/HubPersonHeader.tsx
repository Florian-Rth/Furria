import type { KkImageSource } from '@furria/ui';
import { KkAvatar, KkButton, KkEyebrow, KkScreenHeader } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { PERSON_SCREEN_OPEN_LABEL } from '../group-hub-labels';

const MEMBER_PATH = '/members/$personId';

interface HubPersonHeaderProps {
  groupName: string;
  name: string;
  initials: string;
  portrait: KkImageSource | null;
  personId: number;
  canOpenProfile: boolean;
}

export const HubPersonHeader: FC<HubPersonHeaderProps> = ({
  groupName,
  name,
  initials,
  portrait,
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
        <KkAvatar initials={initials} image={portrait} size="large" />
      </KkScreenHeader.Visual>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{groupName}</KkEyebrow>
        <KkScreenHeader.Title transform="none">{name}</KkScreenHeader.Title>
        {openProfile}
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};

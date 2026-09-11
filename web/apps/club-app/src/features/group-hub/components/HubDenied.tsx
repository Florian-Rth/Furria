import { KkButton } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session';

const DENIED_MESSAGE = 'Diese Gruppe ist nicht deine. Im Verzeichnis kannst du sie ansehen.';
const DENIED_ACTION_LABEL = 'Im Verzeichnis ansehen';
const GROUP_PATH = '/groups/$groupId';

interface HubDeniedProps {
  groupId: string;
}

export const HubDenied: FC<HubDeniedProps> = ({ groupId }) => {
  const params = { groupId };

  const action = (
    <KkButton variant="outlined" component={Link} to={GROUP_PATH} params={params}>
      {DENIED_ACTION_LABEL}
    </KkButton>
  );

  return <AccessDenied message={DENIED_MESSAGE} action={action} />;
};

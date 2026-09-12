import { KkButton, KkEmptyState } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';

const NOT_FOUND_TITLE = 'NICHT IM VERZEICHNIS';
const NOT_FOUND_DESCRIPTION = 'Diese Gruppe gibt es nicht mehr im Verzeichnis.';
const BACK_LABEL = 'Zu den Gruppen';
const GROUPS_PATH = '/groups';

export const GroupNotFound: FC = () => (
  <KkEmptyState
    title={NOT_FOUND_TITLE}
    description={NOT_FOUND_DESCRIPTION}
    action={
      <KkButton variant="outlined" component={Link} to={GROUPS_PATH}>
        {BACK_LABEL}
      </KkButton>
    }
  />
);

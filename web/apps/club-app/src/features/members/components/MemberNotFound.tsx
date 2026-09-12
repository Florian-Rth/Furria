import { KkButton, KkEmptyState } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';

const NOT_FOUND_TITLE = 'NICHT IM VERZEICHNIS';
const NOT_FOUND_DESCRIPTION = 'Diese Person steht nicht im Verzeichnis.';
const BACK_LABEL = 'Zur Mitgliederliste';
const MEMBERS_PATH = '/members';

export const MemberNotFound: FC = () => (
  <KkEmptyState
    title={NOT_FOUND_TITLE}
    description={NOT_FOUND_DESCRIPTION}
    action={
      <KkButton variant="outlined" component={Link} to={MEMBERS_PATH}>
        {BACK_LABEL}
      </KkButton>
    }
  />
);

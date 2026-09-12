import { KkButton, KkEmptyState } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';

const NOT_FOUND_TITLE = 'NICHT IM REGISTER';
const NOT_FOUND_DESCRIPTION = 'Diese Person steht nicht im Register.';
const BACK_LABEL = 'Zur Personenverwaltung';
const PERSONS_PATH = '/manage/persons';

export const PersonEditNotFound: FC = () => (
  <KkEmptyState
    title={NOT_FOUND_TITLE}
    description={NOT_FOUND_DESCRIPTION}
    action={
      <KkButton variant="outlined" component={Link} to={PERSONS_PATH}>
        {BACK_LABEL}
      </KkButton>
    }
  />
);

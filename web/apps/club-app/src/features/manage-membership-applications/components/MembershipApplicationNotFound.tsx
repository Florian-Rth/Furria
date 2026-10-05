import { KkButton, KkEmptyState } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  APPLICATION_NOT_FOUND_DESCRIPTION,
  APPLICATION_NOT_FOUND_TITLE,
  APPLICATIONS_BACK_LABEL,
  APPLICATIONS_PATH,
} from '../manage-membership-applications-labels';

export const MembershipApplicationNotFound: FC = () => (
  <KkEmptyState
    title={APPLICATION_NOT_FOUND_TITLE}
    description={APPLICATION_NOT_FOUND_DESCRIPTION}
    action={
      <KkButton variant="outlined" component={Link} to={APPLICATIONS_PATH}>
        {APPLICATIONS_BACK_LABEL}
      </KkButton>
    }
  />
);

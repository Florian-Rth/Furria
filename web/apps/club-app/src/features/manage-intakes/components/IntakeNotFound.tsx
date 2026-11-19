import { KkButton } from '@furria/ui/KkButton';
import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { INTAKES_PATH, INTAKES_TITLE, NOT_FOUND_LINE, NOT_FOUND_TITLE } from '../intake-labels';

export const IntakeNotFound: FC = () => (
  <KkEmptyState
    title={NOT_FOUND_TITLE}
    description={NOT_FOUND_LINE}
    action={
      <KkButton variant="outlined" component={Link} to={INTAKES_PATH}>
        {INTAKES_TITLE}
      </KkButton>
    }
  />
);

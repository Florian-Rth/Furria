import { KkButton, KkEmptyState, KkIcon } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';

const COLD_EMPTY_TITLE = 'NOCH KEINE PERSON';
const COLD_EMPTY_DESCRIPTION = 'Leg die erste Person an — Name genügt, alles andere kommt später.';
const CREATE_LABEL = 'Person hinzufügen';
const CREATE_ROUTE = '/manage/persons/new';

export const PersonsColdEmpty: FC = () => (
  <KkEmptyState
    title={COLD_EMPTY_TITLE}
    description={COLD_EMPTY_DESCRIPTION}
    action={
      <KkButton startIcon={<KkIcon name="add" size="small" />} component={Link} to={CREATE_ROUTE}>
        {CREATE_LABEL}
      </KkButton>
    }
  />
);

import { KkButton, KkEmptyState, KkIcon } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  CREATE_GROUP_KIND_LABEL,
  GROUP_KINDS_EMPTY_DESCRIPTION,
  GROUP_KINDS_EMPTY_TITLE,
} from '../manage-groups-labels';

const NEW_GROUP_KIND_ROUTE = '/manage/groups/kinds/new';

export const GroupKindsEmpty: FC = () => (
  <KkEmptyState
    title={GROUP_KINDS_EMPTY_TITLE}
    description={GROUP_KINDS_EMPTY_DESCRIPTION}
    action={
      <KkButton
        startIcon={<KkIcon name="add" size="small" />}
        component={Link}
        to={NEW_GROUP_KIND_ROUTE}
      >
        {CREATE_GROUP_KIND_LABEL}
      </KkButton>
    }
  />
);

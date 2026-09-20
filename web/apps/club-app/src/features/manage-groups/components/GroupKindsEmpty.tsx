import { KkButton, KkEmptyState, KkIcon } from '@furria/ui';
import type { FC } from 'react';
import {
  CREATE_GROUP_KIND_LABEL,
  GROUP_KINDS_EMPTY_DESCRIPTION,
  GROUP_KINDS_EMPTY_TITLE,
} from '../manage-groups-labels';

interface GroupKindsEmptyProps {
  onCreate: () => void;
}

export const GroupKindsEmpty: FC<GroupKindsEmptyProps> = ({ onCreate }) => (
  <KkEmptyState
    title={GROUP_KINDS_EMPTY_TITLE}
    description={GROUP_KINDS_EMPTY_DESCRIPTION}
    action={
      <KkButton startIcon={<KkIcon name="add" size="small" />} onClick={onCreate}>
        {CREATE_GROUP_KIND_LABEL}
      </KkButton>
    }
  />
);

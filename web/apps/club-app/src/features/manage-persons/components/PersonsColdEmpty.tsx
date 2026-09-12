import { KkButton, KkEmptyState, KkIcon } from '@furria/ui';
import type { FC } from 'react';

const COLD_EMPTY_TITLE = 'NOCH KEINE PERSON';
const COLD_EMPTY_DESCRIPTION = 'Leg die erste Person an — Name genügt, alles andere kommt später.';
const CREATE_LABEL = 'Person anlegen';

interface PersonsColdEmptyProps {
  onCreate: () => void;
}

export const PersonsColdEmpty: FC<PersonsColdEmptyProps> = ({ onCreate }) => (
  <KkEmptyState
    title={COLD_EMPTY_TITLE}
    description={COLD_EMPTY_DESCRIPTION}
    action={
      <KkButton startIcon={<KkIcon name="add" size="small" />} onClick={onCreate}>
        {CREATE_LABEL}
      </KkButton>
    }
  />
);

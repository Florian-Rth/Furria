import { KkButton, KkEmptyState, KkIcon } from '@furria/ui';
import type { FC } from 'react';

const EMPTY_TITLE = 'NOCH KEINE ROLLE';
const EMPTY_DESCRIPTION =
  'Eine Rolle bündelt Aufgaben und Rechte. Leg die erste an — die Rechte setzt du danach.';
const CREATE_LABEL = 'Rolle anlegen';

interface RolesEmptyProps {
  onCreate: () => void;
}

export const RolesEmpty: FC<RolesEmptyProps> = ({ onCreate }) => (
  <KkEmptyState
    icon="permissions"
    title={EMPTY_TITLE}
    description={EMPTY_DESCRIPTION}
    action={
      <KkButton startIcon={<KkIcon name="add" size="small" />} onClick={onCreate}>
        {CREATE_LABEL}
      </KkButton>
    }
  />
);

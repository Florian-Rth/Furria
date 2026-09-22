import { KkButton, KkEmptyState, KkIcon } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';

const EMPTY_TITLE = 'NOCH KEINE ROLLE';
const EMPTY_DESCRIPTION =
  'Eine Rolle bündelt Aufgaben und Rechte. Leg die erste an — die Rechte setzt du danach.';
const CREATE_LABEL = 'Rolle hinzufügen';
const NEW_ROUTE = '/manage/roles/new';

export const RolesEmpty: FC = () => (
  <KkEmptyState
    title={EMPTY_TITLE}
    description={EMPTY_DESCRIPTION}
    action={
      <KkButton startIcon={<KkIcon name="add" size="small" />} component={Link} to={NEW_ROUTE}>
        {CREATE_LABEL}
      </KkButton>
    }
  />
);

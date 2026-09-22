import { KkButton, KkEmptyState, KkIcon } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';

const EMPTY_TITLE = 'NOCH KEINE VORSTANDSFUNKTION';
const EMPTY_DESCRIPTION =
  'Der Vorstand wird hier festgehalten, nicht erfunden. Leg die erste Funktion an — wer darin sitzt, trägst du danach ein.';
const CREATE_LABEL = 'Funktion hinzufügen';
const NEW_ROUTE = '/manage/board/new';

export const BoardEmpty: FC = () => (
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

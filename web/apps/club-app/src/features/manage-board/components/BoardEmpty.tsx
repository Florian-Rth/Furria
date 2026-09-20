import { KkButton, KkEmptyState, KkIcon } from '@furria/ui';
import type { FC } from 'react';

const EMPTY_TITLE = 'NOCH KEINE VORSTANDSFUNKTION';
const EMPTY_DESCRIPTION =
  'Der Vorstand wird hier festgehalten, nicht erfunden. Leg die erste Funktion an — wer darin sitzt, trägst du danach ein.';
const CREATE_LABEL = 'Funktion anlegen';

interface BoardEmptyProps {
  onCreate: () => void;
}

export const BoardEmpty: FC<BoardEmptyProps> = ({ onCreate }) => (
  <KkEmptyState
    title={EMPTY_TITLE}
    description={EMPTY_DESCRIPTION}
    action={
      <KkButton startIcon={<KkIcon name="add" size="small" />} onClick={onCreate}>
        {CREATE_LABEL}
      </KkButton>
    }
  />
);

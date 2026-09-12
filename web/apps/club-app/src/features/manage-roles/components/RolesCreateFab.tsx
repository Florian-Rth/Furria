import { KkFab } from '@furria/ui';
import type { FC } from 'react';

const CREATE_LABEL = 'Rolle anlegen';

interface RolesCreateFabProps {
  onCreate: () => void;
}

export const RolesCreateFab: FC<RolesCreateFabProps> = ({ onCreate }) => (
  <KkFab label={CREATE_LABEL} icon="add" onClick={onCreate} />
);

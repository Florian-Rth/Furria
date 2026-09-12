import { KkFab } from '@furria/ui';
import type { FC } from 'react';

const CREATE_LABEL = 'Gruppe anlegen';

interface ManagedGroupsCreateFabProps {
  onCreate: () => void;
}

export const ManagedGroupsCreateFab: FC<ManagedGroupsCreateFabProps> = ({ onCreate }) => (
  <KkFab label={CREATE_LABEL} icon="add" onClick={onCreate} />
);

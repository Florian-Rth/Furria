import { KkFab } from '@furria/ui';
import type { FC } from 'react';

interface PersonsCreateFabProps {
  label: string;
  onClick: () => void;
}

export const PersonsCreateFab: FC<PersonsCreateFabProps> = ({ label, onClick }) => (
  <KkFab label={label} onClick={onClick} />
);

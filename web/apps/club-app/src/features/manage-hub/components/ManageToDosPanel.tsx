import type { FC } from 'react';
import type { ToDo } from '@/features/to-dos';
import { ToDosPanel, useToDosBoard } from '@/features/to-dos';
import { MANAGE_TO_DO_SURFACE } from '../api';

interface ManageToDosPanelProps {
  toDos: readonly ToDo[];
}

export const ManageToDosPanel: FC<ManageToDosPanelProps> = ({ toDos }) => {
  const view = useToDosBoard(toDos, MANAGE_TO_DO_SURFACE);

  return <ToDosPanel view={view} />;
};

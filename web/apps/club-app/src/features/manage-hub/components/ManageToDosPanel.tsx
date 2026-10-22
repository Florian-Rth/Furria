import type { FC } from 'react';
import { ToDosPanel } from '@/features/to-dos/components/ToDosPanel';
import { useToDosBoard } from '@/features/to-dos/hooks/use-to-dos-board';
import type { ToDo } from '@/features/to-dos/schemas';
import { MANAGE_TO_DO_SURFACE } from '../api';

interface ManageToDosPanelProps {
  toDos: readonly ToDo[];
}

export const ManageToDosPanel: FC<ManageToDosPanelProps> = ({ toDos }) => {
  const view = useToDosBoard(toDos, MANAGE_TO_DO_SURFACE);

  return <ToDosPanel view={view} />;
};

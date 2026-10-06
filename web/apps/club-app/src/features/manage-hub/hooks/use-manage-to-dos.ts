import { useToDoMarkMutation } from '../api';
import type { ManageToDoBoard, ManageToDoRowModel } from '../manage-to-dos';
import { toManageToDoBoard, toMarkOf } from '../manage-to-dos';
import type { ManageToDo } from '../schemas';

export interface ManageToDosView {
  board: ManageToDoBoard;
  toggleSeen: (row: ManageToDoRowModel) => void;
}

export const useManageToDos = (toDos: readonly ManageToDo[]): ManageToDosView => {
  const mark = useToDoMarkMutation();

  const toggleSeen = (row: ManageToDoRowModel): void => {
    mark.mutate(toMarkOf(row));
  };

  return { board: toManageToDoBoard(toDos), toggleSeen };
};

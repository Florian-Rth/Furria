import type { ToDoMarkSurface } from '../api';
import { useToDoMarkMutation } from '../api';
import type { ToDo } from '../schemas';
import type { ToDoBoard, ToDoRowModel } from '../to-do-board';
import { toMarkOf, toToDoBoard } from '../to-do-board';

export interface ToDosBoardView {
  board: ToDoBoard;
  toggleSeen: (row: ToDoRowModel) => void;
}

export const useToDosBoard = <TData>(
  toDos: readonly ToDo[],
  surface: ToDoMarkSurface<TData>,
): ToDosBoardView => {
  const mark = useToDoMarkMutation(surface);

  const toggleSeen = (row: ToDoRowModel): void => {
    mark.mutate(toMarkOf(row));
  };

  return { board: toToDoBoard(toDos), toggleSeen };
};

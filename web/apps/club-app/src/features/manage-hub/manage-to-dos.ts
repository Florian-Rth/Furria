import type { ToDoMark } from '@/features/to-dos';
import { withToDoMark } from '@/features/to-dos';
import type { ManageHub } from './schemas';

export const withManageToDoMark = (
  hub: ManageHub | undefined,
  mark: ToDoMark,
): ManageHub | undefined =>
  hub === undefined
    ? undefined
    : { ...hub, toDos: hub.toDos.map((toDo) => withToDoMark(toDo, mark)) };

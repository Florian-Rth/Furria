import type { KkLinkSearchValues } from '@furria/ui';
import type { StartPanelOf } from '../start-board';
import { toToDoLabel } from '../start-lines';
import { itemKeyOf } from '../start-visit';
import { TO_DO_LINKS } from '../todo-links';
import type { StartBoard } from './use-start-view';

export interface ToDoCell {
  key: string;
  value: number;
  label: string;
  to: string;
  search: KkLinkSearchValues;
  dimmed: boolean;
}

export const useToDosPanel = (panel: StartPanelOf<'toDos'>, board: StartBoard): ToDoCell[] =>
  panel.toDos.map((toDo) => {
    const key = itemKeyOf({ panel: 'toDos', ...toDo });
    const link = TO_DO_LINKS[toDo.kind];

    return {
      key,
      value: toDo.count,
      label: toToDoLabel(toDo),
      to: link.to,
      search: link.search,
      dimmed: board.dimmedKeys.has(key),
    };
  });

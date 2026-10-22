import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkStartTileReach } from '@furria/ui/reach';
import { Link } from '@tanstack/react-router';
import { TO_DO_ICONS, toToDoLabel } from '@/features/to-dos/to-do-labels';
import { TO_DO_LINKS } from '@/features/to-dos/to-do-links';
import type { StartPanelOf } from '../start-board';

export interface ToDoCounter {
  key: string;
  icon: KkIconName;
  value: number;
  label: string;
  reach: KkStartTileReach;
}

export const useToDosTile = (panel: StartPanelOf<'toDos'>): ToDoCounter[] =>
  panel.toDos.map((toDo) => {
    const link = TO_DO_LINKS[toDo.kind];
    const label = toToDoLabel(toDo);

    return {
      key: toDo.kind,
      icon: TO_DO_ICONS[toDo.kind],
      value: toDo.count,
      label,
      reach: { label: `${toDo.count} ${label}`, component: Link, to: link.to, search: link.search },
    };
  });

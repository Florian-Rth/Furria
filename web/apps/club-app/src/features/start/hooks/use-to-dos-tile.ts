import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkStartTileReach } from '@furria/ui/reach';
import { Link } from '@tanstack/react-router';
import { TO_DO_ICONS, toToDoLabel } from '@/features/to-dos/to-do-labels';
import { toToDoLink } from '@/features/to-dos/to-do-links';
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
    const link = toToDoLink(toDo);
    const label = toToDoLabel(toDo, toDo.group?.name ?? null);

    return {
      key: `${toDo.kind}-${toDo.group?.groupId ?? 'club'}`,
      icon: TO_DO_ICONS[toDo.kind],
      value: toDo.count,
      label,
      reach: {
        label: `${toDo.count} ${label}`,
        component: Link,
        to: link.to,
        params: link.params,
        search: link.search,
      },
    };
  });

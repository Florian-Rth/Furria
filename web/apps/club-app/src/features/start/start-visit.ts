import type { ToDoKind } from '@/features/to-dos';
import type {
  Start,
  StartGroupMomentKind,
  StartMineKind,
  StartPanel,
  StartPanelKind,
} from './schemas';

export type StartItemRef =
  | { panel: 'calendar'; calendarEntryId: number }
  | { panel: 'announcements'; announcementId: number }
  | { panel: 'mine'; kind: StartMineKind; subjectId: number | null; on: string }
  | { panel: 'groups'; kind: StartGroupMomentKind; groupId: number }
  | { panel: 'toDos'; kind: ToDoKind };

export interface StartVisit {
  start: Start;
  dimmedKeys: ReadonlySet<string>;
}

type PanelOf<TKind extends StartPanelKind> = Extract<StartPanel, { kind: TKind }>;

const NO_SUBJECT = 0;

export const itemKeyOf = (ref: StartItemRef): string => {
  if (ref.panel === 'calendar') {
    return `calendar:${ref.calendarEntryId}`;
  }
  if (ref.panel === 'announcements') {
    return `announcements:${ref.announcementId}`;
  }
  if (ref.panel === 'mine') {
    return `mine:${ref.kind}:${ref.subjectId ?? NO_SUBJECT}:${ref.on}`;
  }
  if (ref.panel === 'groups') {
    return `groups:${ref.kind}:${ref.groupId}`;
  }

  return `toDos:${ref.kind}`;
};

export const panelItemKeysOf = (panel: StartPanel): string[] => {
  if (panel.kind === 'calendar') {
    return panel.entries.map((entry) => itemKeyOf({ panel: 'calendar', ...entry }));
  }
  if (panel.kind === 'announcements') {
    return panel.announcements.map((announcement) =>
      itemKeyOf({ panel: 'announcements', ...announcement }),
    );
  }
  if (panel.kind === 'mine') {
    return panel.mine.map((mine) => itemKeyOf({ panel: 'mine', ...mine }));
  }
  if (panel.kind === 'groups') {
    return panel.groupMoments.map((moment) => itemKeyOf({ panel: 'groups', ...moment }));
  }
  if (panel.kind === 'gallery') {
    return [];
  }

  return panel.toDos.map((toDo) => itemKeyOf({ panel: 'toDos', ...toDo }));
};

const isPanelOf =
  <TKind extends StartPanelKind>(kind: TKind) =>
  (panel: StartPanel): panel is PanelOf<TKind> =>
    panel.kind === kind;

const freshPanelOf = <TKind extends StartPanelKind>(
  fresh: Start,
  kind: TKind,
): PanelOf<TKind> | undefined => fresh.panels.find(isPanelOf(kind));

const keepOrder = <TItem>(
  frozen: readonly TItem[],
  fresh: readonly TItem[],
  keyOf: (item: TItem) => string,
): TItem[] => {
  const freshByKey = new Map(fresh.map((item) => [keyOf(item), item]));

  return frozen.map((item) => freshByKey.get(keyOf(item)) ?? item);
};

const reconcilePanel = (panel: StartPanel, fresh: Start): StartPanel => {
  if (panel.kind === 'calendar') {
    return {
      ...panel,
      entries: keepOrder(panel.entries, freshPanelOf(fresh, 'calendar')?.entries ?? [], (entry) =>
        itemKeyOf({ panel: 'calendar', ...entry }),
      ),
    };
  }
  if (panel.kind === 'announcements') {
    return {
      ...panel,
      announcements: keepOrder(
        panel.announcements,
        freshPanelOf(fresh, 'announcements')?.announcements ?? [],
        (announcement) => itemKeyOf({ panel: 'announcements', ...announcement }),
      ),
    };
  }
  if (panel.kind === 'mine') {
    return {
      ...panel,
      mine: keepOrder(panel.mine, freshPanelOf(fresh, 'mine')?.mine ?? [], (mine) =>
        itemKeyOf({ panel: 'mine', ...mine }),
      ),
    };
  }
  if (panel.kind === 'groups') {
    return {
      ...panel,
      groupMoments: keepOrder(
        panel.groupMoments,
        freshPanelOf(fresh, 'groups')?.groupMoments ?? [],
        (moment) => itemKeyOf({ panel: 'groups', ...moment }),
      ),
    };
  }
  if (panel.kind === 'gallery') {
    return freshPanelOf(fresh, 'gallery') ?? panel;
  }

  return {
    ...panel,
    toDos: keepOrder(panel.toDos, freshPanelOf(fresh, 'toDos')?.toDos ?? [], (toDo) =>
      itemKeyOf({ panel: 'toDos', ...toDo }),
    ),
  };
};

const itemKeysOf = (start: Start): Set<string> => new Set(start.panels.flatMap(panelItemKeysOf));

export const toStartVisit = (start: Start): StartVisit => ({ start, dimmedKeys: new Set() });

export const reconcileFrozenVisit = (
  frozen: StartVisit,
  fresh: Start,
  touched: ReadonlySet<string>,
): StartVisit => {
  const freshKeys = itemKeysOf(fresh);
  const dimmedKeys = new Set(
    [...itemKeysOf(frozen.start)].filter((key) => !freshKeys.has(key) && !touched.has(key)),
  );

  return {
    start: { ...fresh, panels: frozen.start.panels.map((panel) => reconcilePanel(panel, fresh)) },
    dimmedKeys,
  };
};

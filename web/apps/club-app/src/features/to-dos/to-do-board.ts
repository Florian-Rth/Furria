import type { KkIconName } from '@furria/ui';
import type { ToDo, ToDoKind } from './schemas';
import { TO_DO_ICONS, toToDoLabel } from './to-do-labels';
import type { ToDoLink } from './to-do-links';
import { TO_DO_LINKS } from './to-do-links';

export const TO_DOS_PANEL_TITLE = 'Zu erledigen';

const SEEN_FOLD_LABEL = 'Gesehen';
const LABEL_SEPARATOR = ' · ';
const NOTHING_NEW = 0;
const LOCALE = 'de-DE';

export type ToDoCountTone = 'gold' | 'neutral';

export interface ToDoRowModel {
  kind: ToDoKind;
  label: string;
  icon: KkIconName;
  count: string;
  countTone: ToDoCountTone;
  flag: string | undefined;
  link: ToDoLink;
  version: string;
  isSeenWhole: boolean;
  toggleLabel: string;
  toggleIcon: KkIconName;
}

export interface ToDoBoard {
  open: ToDoRowModel[];
  seen: ToDoRowModel[];
  seenLabel: string;
  seenFlag: string | undefined;
}

export interface ToDoMark {
  kind: ToDoKind;
  version: string;
  seen: boolean;
}

const toSentenceStart = (text: string): string =>
  `${text.charAt(0).toLocaleUpperCase(LOCALE)}${text.slice(1)}`;

const toNewFlag = (newCount: number): string | undefined =>
  newCount > NOTHING_NEW ? `${newCount} neu` : undefined;

const isSeenWhole = (toDo: ToDo): boolean => toDo.isSeen && toDo.newCount === NOTHING_NEW;

const toRow = (toDo: ToDo): ToDoRowModel => {
  const label = toSentenceStart(toToDoLabel(toDo));
  const seenWhole = isSeenWhole(toDo);

  return {
    kind: toDo.kind,
    label,
    icon: TO_DO_ICONS[toDo.kind],
    count: String(toDo.count),
    countTone: seenWhole ? 'neutral' : 'gold',
    flag: toDo.isSeen ? toNewFlag(toDo.newCount) : undefined,
    link: TO_DO_LINKS[toDo.kind],
    version: toDo.version,
    isSeenWhole: seenWhole,
    toggleLabel: `${SEEN_FOLD_LABEL}: ${label}`,
    toggleIcon: seenWhole ? 'checkCircleFilled' : 'checkCircle',
  };
};

export const toToDoBoard = (toDos: readonly ToDo[]): ToDoBoard => {
  const seen = toDos.filter((toDo) => toDo.isSeen);
  const newCount = seen.reduce((sum, toDo) => sum + toDo.newCount, NOTHING_NEW);

  return {
    open: toDos.filter((toDo) => !toDo.isSeen).map(toRow),
    seen: seen.map(toRow),
    seenLabel: `${SEEN_FOLD_LABEL}${LABEL_SEPARATOR}${seen.length}`,
    seenFlag: toNewFlag(newCount),
  };
};

export const toMarkOf = (row: ToDoRowModel): ToDoMark => ({
  kind: row.kind,
  version: row.version,
  seen: !row.isSeenWhole,
});

export const withToDoMark = (toDo: ToDo, mark: ToDoMark): ToDo =>
  toDo.kind === mark.kind ? { ...toDo, isSeen: mark.seen, newCount: NOTHING_NEW } : toDo;

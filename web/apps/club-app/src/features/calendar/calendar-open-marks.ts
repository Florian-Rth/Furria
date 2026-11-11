import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkOpenMark } from '@furria/ui/KkOpenMarks';
import { CALENDAR_ADD_ON_ICONS } from './calendar-add-ons';
import { OPEN_MARK_LABELS } from './calendar-agenda-copy';
import type { CalendarOpenFunction } from './schemas';

export type OpenMarkKind = 'vote' | 'signUpList';

export interface OpenMarkFacts {
  mayAnswer: boolean;
  openFunctions: readonly CalendarOpenFunction[];
}

const OPEN_MARK_ICONS: Record<OpenMarkKind, KkIconName> = {
  vote: CALENDAR_ADD_ON_ICONS.poll,
  signUpList: CALENDAR_ADD_ON_ICONS.signUpList,
};

const markKindOf = (open: CalendarOpenFunction): OpenMarkKind | null => {
  if (open.hasAnswered) {
    return null;
  }
  if (open.kind === 'poll') {
    return 'vote';
  }
  if (open.kind === 'signUpList') {
    return 'signUpList';
  }

  return null;
};

export const toOpenMarkKinds = (facts: OpenMarkFacts): OpenMarkKind[] => {
  if (!facts.mayAnswer) {
    return [];
  }

  const kinds = facts.openFunctions
    .map(markKindOf)
    .filter((kind): kind is OpenMarkKind => kind !== null);

  return [...new Set(kinds)];
};

export const toOpenMarks = (facts: OpenMarkFacts): KkOpenMark[] =>
  toOpenMarkKinds(facts).map((kind) => ({
    key: kind,
    icon: OPEN_MARK_ICONS[kind],
    label: OPEN_MARK_LABELS[kind],
  }));

import type { CalendarDeadlineIssueCode, CalendarDeadlineStart } from './calendar-deadlines';
import {
  NO_DEADLINE,
  toDeadlineDayChange,
  toDeadlineFields,
  toDeadlineInstant,
  toDeadlineIssueCodes,
} from './calendar-deadlines';
import type {
  CalendarAddOnCardForm,
  CalendarEntryAddOn,
  CalendarSignUpLine,
  CalendarSignUpList,
  CalendarSignUpListForm,
} from './schemas';

export const SIGN_UP_LIST_TITLE_MAX_LENGTH = 120;
export const SIGN_UP_LIST_HINT_MAX_LENGTH = 300;
export const SIGN_UP_LINE_TEXT_MAX_LENGTH = 120;

export type CalendarSignUpListIssueCode =
  | 'titleMissing'
  | 'titleTooLong'
  | 'hintTooLong'
  | CalendarDeadlineIssueCode;

export interface CalendarSignUpListIssue {
  code: CalendarSignUpListIssueCode;
  path: (string | number)[];
}

export type SignUpListFieldPath =
  | `addOns.${number}.signUpList.title`
  | `addOns.${number}.signUpList.hint`
  | `addOns.${number}.signUpList.signUpUntilTime`;

const toTitleIssues = (list: CalendarSignUpListForm): CalendarSignUpListIssueCode[] => {
  const title = list.title.trim();

  if (title === '') {
    return ['titleMissing'];
  }

  return title.length > SIGN_UP_LIST_TITLE_MAX_LENGTH ? ['titleTooLong'] : [];
};

const toHintIssues = (list: CalendarSignUpListForm): CalendarSignUpListIssueCode[] =>
  list.hint.trim().length > SIGN_UP_LIST_HINT_MAX_LENGTH ? ['hintTooLong'] : [];

const toCardIssues = (
  list: CalendarSignUpListForm,
  cardIndex: number,
  start: CalendarDeadlineStart,
): CalendarSignUpListIssue[] => {
  const listPath = ['addOns', cardIndex, 'signUpList'];

  return [
    ...toTitleIssues(list).map((code) => ({ code, path: [...listPath, 'title'] })),
    ...toHintIssues(list).map((code) => ({ code, path: [...listPath, 'hint'] })),
    ...toDeadlineIssueCodes({ day: list.signUpUntilDay, time: list.signUpUntilTime }, start).map(
      (code) => ({ code, path: [...listPath, 'signUpUntilTime'] }),
    ),
  ];
};

export const toSignUpListIssues = (
  cards: readonly CalendarAddOnCardForm[],
  start: CalendarDeadlineStart,
): CalendarSignUpListIssue[] =>
  cards.flatMap((card, cardIndex) =>
    card.kind === 'signUpList' ? toCardIssues(card.signUpList, cardIndex, start) : [],
  );

export type CalendarSignUpListPayload = {
  signUpListId: number | null;
  title: string;
  hint: string | null;
  signUpUntil: string | null;
};

export const toSignUpListPayload = (list: CalendarSignUpListForm): CalendarSignUpListPayload => {
  const hint = list.hint.trim();

  return {
    signUpListId: list.signUpListId,
    title: list.title.trim(),
    hint: hint === '' ? null : hint,
    signUpUntil: toDeadlineInstant({
      day: list.signUpUntilDay,
      time: list.signUpUntilTime,
      held: list.heldSignUpUntil,
    }),
  };
};

export const toSignUpListForm = (list: CalendarSignUpList): CalendarSignUpListForm => {
  const deadline = toDeadlineFields(list.signUpUntil);

  return {
    signUpListId: list.signUpListId,
    title: list.title,
    hint: list.hint ?? '',
    signUpUntilDay: deadline.day,
    signUpUntilTime: deadline.time,
    heldSignUpUntil: deadline.held,
  };
};

export const toNewSignUpListForm = (): CalendarSignUpListForm => ({
  signUpListId: null,
  title: '',
  hint: '',
  signUpUntilDay: NO_DEADLINE,
  signUpUntilTime: NO_DEADLINE,
  heldSignUpUntil: null,
});

export const toHeldSignUpList = (
  addOns: readonly CalendarEntryAddOn[] | null,
  signUpListId: number | null,
): CalendarSignUpList | null =>
  signUpListId === null
    ? null
    : ((addOns ?? [])
        .flatMap((addOn) => (addOn.kind === 'signUpList' ? [addOn.signUpList] : []))
        .find((list) => list.signUpListId === signUpListId) ?? null);

export const toDiscardedLineCount = (
  addOns: readonly CalendarEntryAddOn[] | null,
  signUpListId: number | null,
): number => toHeldSignUpList(addOns, signUpListId)?.lines.length ?? 0;

export const withSignUpUntilDay = (
  list: CalendarSignUpListForm,
  day: string | null,
  fallbackTime: string,
): CalendarSignUpListForm => {
  const deadline = toDeadlineDayChange({ time: list.signUpUntilTime }, day, fallbackTime);

  return { ...list, signUpUntilDay: deadline.day, signUpUntilTime: deadline.time };
};

export const toViewerLine = (list: Pick<CalendarSignUpList, 'lines'>): CalendarSignUpLine | null =>
  list.lines.find((line) => line.byViewer) ?? null;

export const toLineText = (draft: string): string | null => {
  const text = draft.trim();

  return text === '' ? null : text;
};

export interface CalendarOwnLineState {
  isOpen: boolean;
  hasLine: boolean;
  canSave: boolean;
  isTooLong: boolean;
}

export const toOwnLineState = (
  list: Pick<CalendarSignUpList, 'isClosed' | 'lines'>,
  draft: string,
): CalendarOwnLineState => {
  const held = toViewerLine(list);
  const text = toLineText(draft);
  const isTooLong = (text?.length ?? 0) > SIGN_UP_LINE_TEXT_MAX_LENGTH;
  const isChanged = held === null || held.text !== text;

  return {
    isOpen: !list.isClosed,
    hasLine: held !== null,
    canSave: !list.isClosed && isChanged && !isTooLong,
    isTooLong,
  };
};

export type CalendarSignUpLineRow = CalendarSignUpLine & { canRemove: boolean };

export const toSignUpLineRows = (
  list: Pick<CalendarSignUpList, 'isClosed' | 'lines'>,
  mayModerate: boolean,
): CalendarSignUpLineRow[] =>
  list.lines.map((line) => ({
    ...line,
    canRemove: mayModerate && (!line.byViewer || list.isClosed),
  }));

export type OwnLineBox = 'hidden' | 'entry' | 'line' | 'editing' | 'readOnly';

export interface OwnLineBoxFacts {
  isClosed: boolean;
  mayAnswer: boolean;
  hasLine: boolean;
  isEditing: boolean;
}

export const toOwnLineBox = (facts: OwnLineBoxFacts): OwnLineBox => {
  const takesLines = !facts.isClosed && facts.mayAnswer;

  if (!facts.hasLine) {
    return takesLines ? 'entry' : 'hidden';
  }
  if (!takesLines) {
    return 'readOnly';
  }

  return facts.isEditing ? 'editing' : 'line';
};

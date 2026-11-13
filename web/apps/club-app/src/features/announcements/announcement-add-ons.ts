import type { AddOnAnswering } from '@/features/calendar/add-on-host';
import { ADD_ON_LIMIT } from '@/features/calendar/calendar-add-ons';
import {
  NO_DEADLINE,
  NO_START,
  toDeadlineDayChange,
  toDeadlineFields,
  toDeadlineInstant,
} from '@/features/calendar/calendar-deadlines';
import type { CalendarPollPayload } from '@/features/calendar/calendar-polls';
import {
  toDiscardedVoterCount,
  toNewPollForm,
  toPollForm,
  toPollPayload,
} from '@/features/calendar/calendar-polls';
import type { CalendarSignUpListPayload } from '@/features/calendar/calendar-sign-up-lists';
import {
  toDiscardedLineCount,
  toNewSignUpListForm,
  toSignUpListForm,
  toSignUpListPayload,
} from '@/features/calendar/calendar-sign-up-lists';
import type {
  CalendarAddOnKind,
  CalendarEntryAddOn,
  CalendarPollForm,
  CalendarSignUpListForm,
} from '@/features/calendar/schemas';
import { toInstant } from '@/lib/day';
import { toAnnouncementDeadlineStart } from './announcement-add-on-issues';
import {
  toBorrowedAddOnKey,
  toBorrowedForm,
  toLentCalendarAddOn,
  toLentName,
} from './announcement-borrowing';
import type {
  Announcement,
  AnnouncementAddOn,
  AnnouncementAddOnCardForm,
  AnnouncementAddOnKind,
  AnnouncementAttendance,
  AnnouncementAttendanceForm,
  AnnouncementForm,
  BorrowedAnnouncementAddOn,
} from './schemas';
import { AnnouncementAddOnKindSchema } from './schemas';

const ANNOUNCEMENT_ADD_ON_ORDER: readonly AnnouncementAddOnKind[] = [
  'attendance',
  'poll',
  'signUpList',
];
const ATTENDANCE_KEY = 'attendance';
export const ANNOUNCEMENT_DEADLINE_FALLBACK_TIME = '20:00';

export type AnnouncementAttendancePayload = { answersUntil: string | null };

export type BorrowedAddOnPayload = { calendarEntryId: number; addOnId: number | null };

export type AnnouncementAddOnPayload = {
  kind: AnnouncementAddOnKind;
  attendance: AnnouncementAttendancePayload | null;
  poll: CalendarPollPayload | null;
  signUpList: CalendarSignUpListPayload | null;
  borrowed: BorrowedAddOnPayload | null;
};

export type AnnouncementPayload = {
  title: string;
  body: string;
  validUntil: string | null;
  addOns: AnnouncementAddOnPayload[];
};

const NO_DETAILS = { attendance: null, poll: null, signUpList: null, borrowed: null } as const;

export const toAnnouncementAddOnKind = (kind: CalendarAddOnKind): AnnouncementAddOnKind | null => {
  const parsed = AnnouncementAddOnKindSchema.safeParse(kind);

  return parsed.success ? parsed.data : null;
};

export const toOfferedAnnouncementAddOns = (
  attached: readonly Pick<AnnouncementAddOnCardForm, 'kind'>[],
): AnnouncementAddOnKind[] =>
  attached.length >= ADD_ON_LIMIT
    ? []
    : ANNOUNCEMENT_ADD_ON_ORDER.filter(
        (kind) => kind !== 'attendance' || !attached.some((card) => card.kind === 'attendance'),
      );

export const toAnnouncementClosesAt = (validUntil: string | null): string | null => {
  const start = toAnnouncementDeadlineStart(validUntil);

  return start.day === NO_START ? null : toInstant(start.day, start.time);
};

export const toAnswerCountOf = (
  attendance: Pick<AnnouncementAttendance, 'yes' | 'maybe' | 'no'>,
): number => attendance.yes + attendance.maybe + attendance.no;

export type AnswersUntilPath = `addOns.${number}.attendance.answersUntilTime`;

export const toAnswersUntilPath = (index: number): AnswersUntilPath =>
  `addOns.${index}.attendance.answersUntilTime`;

export const toAnswersUntilPaths = (
  cards: readonly Pick<AnnouncementAddOnCardForm, 'kind'>[],
): AnswersUntilPath[] =>
  cards.flatMap((card, index) => (card.kind === 'attendance' ? [toAnswersUntilPath(index)] : []));

export const toAnnouncementAnswering = (
  announcement: Pick<Announcement, 'announcementId' | 'viewerMayAnswer'>,
): AddOnAnswering => ({
  host: { kind: 'announcement', announcementId: announcement.announcementId },
  mayAnswer: announcement.viewerMayAnswer,
});

const toAttendanceForm = (answersUntil: string | null): AnnouncementAttendanceForm => {
  const fields = toDeadlineFields(answersUntil);

  return {
    answersUntilDay: fields.day,
    answersUntilTime: fields.time,
    heldAnswersUntil: fields.held,
  };
};

export const toAnnouncementAddOnKey = (addOn: AnnouncementAddOn): string => {
  switch (addOn.kind) {
    case 'borrowed':
      return toBorrowedAddOnKey({
        lentKind: addOn.lentKind,
        calendarEntryId: addOn.entry.calendarEntryId,
        addOnId: addOn.addOnId,
      });
    case 'attendance':
      return ATTENDANCE_KEY;
    case 'poll':
      return `poll-${addOn.poll.pollId}`;
    case 'signUpList':
      return `sign-up-list-${addOn.signUpList.signUpListId}`;
  }
};

const toAddOnCard = (addOn: AnnouncementAddOn): AnnouncementAddOnCardForm => {
  const key = toAnnouncementAddOnKey(addOn);

  switch (addOn.kind) {
    case 'borrowed':
      return {
        key,
        kind: addOn.kind,
        borrowed: toBorrowedForm(addOn.entry, addOn.lentKind, addOn.addOnId),
      };
    case 'attendance':
      return { key, kind: addOn.kind, attendance: toAttendanceForm(addOn.attendance.answersUntil) };
    case 'poll':
      return { key, kind: addOn.kind, poll: toPollForm(addOn.poll) };
    case 'signUpList':
      return { key, kind: addOn.kind, signUpList: toSignUpListForm(addOn.signUpList) };
  }
};

export const toAnnouncementFormValues = (announcement: Announcement | null): AnnouncementForm =>
  announcement === null
    ? { title: '', body: '', validUntil: null, addOns: [] }
    : {
        title: announcement.title,
        body: announcement.body,
        validUntil: announcement.validUntil,
        addOns: announcement.addOns.map(toAddOnCard),
      };

export const toAttachedAnnouncementCards = (
  cards: readonly AnnouncementAddOnCardForm[],
  kind: AnnouncementAddOnKind,
  nextKey: () => string,
): AnnouncementAddOnCardForm[] => {
  switch (kind) {
    case 'attendance':
      return cards.some((card) => card.kind === 'attendance')
        ? [...cards]
        : [...cards, { key: ATTENDANCE_KEY, kind, attendance: toAttendanceForm(null) }];
    case 'poll':
      return [...cards, { key: nextKey(), kind, poll: toNewPollForm([nextKey(), nextKey()]) }];
    case 'signUpList':
      return [...cards, { key: nextKey(), kind, signUpList: toNewSignUpListForm() }];
  }
};

export const toChangedAttendanceCards = (
  cards: readonly AnnouncementAddOnCardForm[],
  change: (attendance: AnnouncementAttendanceForm) => AnnouncementAttendanceForm,
): AnnouncementAddOnCardForm[] =>
  cards.map((card) =>
    card.kind === 'attendance' ? { ...card, attendance: change(card.attendance) } : card,
  );

export const toChangedAnnouncementPollCards = (
  cards: readonly AnnouncementAddOnCardForm[],
  key: string,
  change: (poll: CalendarPollForm) => CalendarPollForm,
): AnnouncementAddOnCardForm[] =>
  cards.map((card) =>
    card.kind === 'poll' && card.key === key ? { ...card, poll: change(card.poll) } : card,
  );

export const toChangedAnnouncementSignUpListCards = (
  cards: readonly AnnouncementAddOnCardForm[],
  key: string,
  change: (list: CalendarSignUpListForm) => CalendarSignUpListForm,
): AnnouncementAddOnCardForm[] =>
  cards.map((card) =>
    card.kind === 'signUpList' && card.key === key
      ? { ...card, signUpList: change(card.signUpList) }
      : card,
  );

export const withAnswersUntilDay = (
  attendance: AnnouncementAttendanceForm,
  day: string | null,
): AnnouncementAttendanceForm => {
  const change = toDeadlineDayChange(
    { time: attendance.answersUntilTime },
    day,
    ANNOUNCEMENT_DEADLINE_FALLBACK_TIME,
  );

  return { ...attendance, answersUntilDay: change.day, answersUntilTime: change.time };
};

export const hasNoAnswersUntil = (attendance: AnnouncementAttendanceForm): boolean =>
  attendance.answersUntilDay === NO_DEADLINE;

const toHeldCalendarAddOn = (addOn: AnnouncementAddOn): CalendarEntryAddOn[] => {
  switch (addOn.kind) {
    case 'attendance':
      return [{ kind: addOn.kind }];
    case 'poll':
      return [{ kind: addOn.kind, poll: addOn.poll }];
    case 'signUpList':
      return [{ kind: addOn.kind, signUpList: addOn.signUpList }];
    case 'borrowed':
      return [];
  }
};

export const toHeldCalendarAddOns = (
  announcement: Pick<Announcement, 'addOns'> | null,
): CalendarEntryAddOn[] | null => announcement?.addOns.flatMap(toHeldCalendarAddOn) ?? null;

export const toHeldAttendance = (
  announcement: Pick<Announcement, 'addOns'> | null,
): AnnouncementAttendance | null => {
  const held = announcement?.addOns.find((addOn) => addOn.kind === 'attendance');

  return held?.kind === 'attendance' ? held.attendance : null;
};

export const toDiscardedAnnouncementAnswers = (
  card: AnnouncementAddOnCardForm,
  announcement: Pick<Announcement, 'addOns'> | null,
): number => {
  const held = toHeldCalendarAddOns(announcement);

  switch (card.kind) {
    case 'attendance': {
      const attendance = toHeldAttendance(announcement);

      return attendance === null ? 0 : toAnswerCountOf(attendance);
    }
    case 'poll':
      return toDiscardedVoterCount(held, card.poll.pollId);
    case 'signUpList':
      return toDiscardedLineCount(held, card.signUpList.signUpListId);
    case 'borrowed':
      return 0;
  }
};

const toAddOnPayload = (card: AnnouncementAddOnCardForm): AnnouncementAddOnPayload => {
  switch (card.kind) {
    case 'attendance':
      return {
        ...NO_DETAILS,
        kind: card.kind,
        attendance: {
          answersUntil: toDeadlineInstant({
            day: card.attendance.answersUntilDay,
            time: card.attendance.answersUntilTime,
            held: card.attendance.heldAnswersUntil,
          }),
        },
      };
    case 'poll':
      return { ...NO_DETAILS, kind: card.kind, poll: toPollPayload(card.poll) };
    case 'signUpList':
      return { ...NO_DETAILS, kind: card.kind, signUpList: toSignUpListPayload(card.signUpList) };
    case 'borrowed':
      return {
        ...NO_DETAILS,
        kind: card.borrowed.lentKind,
        borrowed: {
          calendarEntryId: card.borrowed.calendarEntryId,
          addOnId: card.borrowed.addOnId,
        },
      };
  }
};

export const toAnnouncementPayload = (form: AnnouncementForm): AnnouncementPayload => ({
  title: form.title,
  body: form.body,
  validUntil: form.validUntil,
  addOns: form.addOns.map(toAddOnPayload),
});

export type AnnouncementAddOnState = 'owed' | 'answered' | 'closed' | 'quiet';

export interface AnnouncementAddOnMark {
  key: string;
  kind: AnnouncementAddOnKind;
  state: AnnouncementAddOnState;
  name: string | null;
  until: string | null;
}

type AnnouncementAnswerState = Pick<Announcement, 'viewerAnswer' | 'viewerMayAnswer'>;

interface AnswerFacts {
  hasAnswered: boolean;
  isOpen: boolean;
  isClosed: boolean;
  mayAnswer: boolean;
  name: string | null;
  until: string | null;
}

const stateOf = ({
  hasAnswered,
  isOpen,
  isClosed,
  mayAnswer,
}: AnswerFacts): AnnouncementAddOnState => {
  if (hasAnswered) {
    return 'answered';
  }
  if (isClosed) {
    return 'closed';
  }

  return isOpen && mayAnswer ? 'owed' : 'quiet';
};

const borrowedFactsOf = ({ entry, addOnId, lentKind }: BorrowedAnnouncementAddOn): AnswerFacts => {
  const lent = { name: toLentName(toLentCalendarAddOn(entry, lentKind, addOnId)), until: null };

  if (addOnId === null) {
    return {
      ...lent,
      hasAnswered: entry.viewerAnswer !== null,
      isOpen: entry.asksForResponse,
      isClosed: false,
      mayAnswer: entry.mayAnswer,
    };
  }

  const open = entry.openFunctions.find(
    (candidate) => candidate.kind === lentKind && candidate.addOnId === addOnId,
  );

  return {
    ...lent,
    hasAnswered: open?.hasAnswered ?? false,
    isOpen: open !== undefined,
    isClosed: false,
    mayAnswer: entry.mayAnswer,
  };
};

const answerFactsOf = (addOn: AnnouncementAddOn, state: AnnouncementAnswerState): AnswerFacts => {
  switch (addOn.kind) {
    case 'borrowed':
      return borrowedFactsOf(addOn);
    case 'attendance':
      return {
        hasAnswered: state.viewerAnswer !== null,
        isOpen: !addOn.attendance.isClosed,
        isClosed: addOn.attendance.isClosed,
        mayAnswer: state.viewerMayAnswer,
        name: null,
        until: addOn.attendance.answersUntil,
      };
    case 'poll':
      return {
        hasAnswered: addOn.poll.options.some((option) => option.viewerChose),
        isOpen: !addOn.poll.isClosed,
        isClosed: addOn.poll.isClosed,
        mayAnswer: state.viewerMayAnswer,
        name: addOn.poll.question,
        until: addOn.poll.votesUntil,
      };
    case 'signUpList':
      return {
        hasAnswered: addOn.signUpList.lines.some((line) => line.byViewer),
        isOpen: !addOn.signUpList.isClosed,
        isClosed: addOn.signUpList.isClosed,
        mayAnswer: state.viewerMayAnswer,
        name: addOn.signUpList.title,
        until: addOn.signUpList.signUpUntil,
      };
  }
};

const kindOf = (addOn: AnnouncementAddOn): AnnouncementAddOnKind =>
  addOn.kind === 'borrowed' ? addOn.lentKind : addOn.kind;

export const toAnnouncementAddOnMarks = (
  announcement: Pick<Announcement, 'addOns' | 'viewerAnswer' | 'viewerMayAnswer'>,
): AnnouncementAddOnMark[] =>
  announcement.addOns.map((addOn) => {
    const facts = answerFactsOf(addOn, announcement);
    const isOpen = !facts.isClosed;

    return {
      key: toAnnouncementAddOnKey(addOn),
      kind: kindOf(addOn),
      state: stateOf(facts),
      name: facts.name,
      until: isOpen ? facts.until : null,
    };
  });

export const owesAnyAnswer = (marks: readonly AnnouncementAddOnMark[]): boolean =>
  marks.some((mark) => mark.state === 'owed');

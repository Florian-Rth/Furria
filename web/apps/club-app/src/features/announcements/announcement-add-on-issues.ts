import type {
  CalendarDeadlineIssueCode,
  CalendarDeadlineStart,
} from '@/features/calendar/calendar-deadlines';
import {
  NO_START,
  toDeadlineInstant,
  toDeadlineIssueCodes,
} from '@/features/calendar/calendar-deadlines';
import type { CalendarPollIssueCode } from '@/features/calendar/calendar-polls';
import { toPollIssues } from '@/features/calendar/calendar-polls';
import type { CalendarSignUpListIssueCode } from '@/features/calendar/calendar-sign-up-lists';
import { toSignUpListIssues } from '@/features/calendar/calendar-sign-up-lists';
import { shiftDay } from '@/lib/day';
import type { AnnouncementAddOnCardForm, OwnAnnouncementAddOnCardForm } from './schemas';

const START_OF_DAY = '00:00';

export type AnnouncementAddOnIssue =
  | { addOn: 'attendance'; code: CalendarDeadlineIssueCode; path: (string | number)[] }
  | { addOn: 'poll'; code: CalendarPollIssueCode; path: (string | number)[] }
  | { addOn: 'signUpList'; code: CalendarSignUpListIssueCode; path: (string | number)[] };

export const toAnnouncementDeadlineStart = (validUntil: string | null): CalendarDeadlineStart =>
  validUntil === null
    ? { day: NO_START, time: NO_START }
    : { day: shiftDay(validUntil, 1), time: START_OF_DAY };

const toAttendanceIssues = (
  cards: readonly AnnouncementAddOnCardForm[],
  start: CalendarDeadlineStart,
): AnnouncementAddOnIssue[] =>
  cards.flatMap((card, cardIndex) =>
    card.kind === 'attendance'
      ? toDeadlineIssueCodes(
          { day: card.attendance.answersUntilDay, time: card.attendance.answersUntilTime },
          start,
        ).map(
          (code): AnnouncementAddOnIssue => ({
            addOn: 'attendance',
            code,
            path: ['addOns', cardIndex, 'attendance', 'answersUntilTime'],
          }),
        )
      : [],
  );

const toHeldDeadline = (card: OwnAnnouncementAddOnCardForm): string | null => {
  switch (card.kind) {
    case 'attendance':
      return card.attendance.heldAnswersUntil;
    case 'poll':
      return card.poll.heldVotesUntil;
    case 'signUpList':
      return card.signUpList.heldSignUpUntil;
  }
};

const toDeadlineFieldsOf = (card: OwnAnnouncementAddOnCardForm): { day: string; time: string } => {
  switch (card.kind) {
    case 'attendance':
      return { day: card.attendance.answersUntilDay, time: card.attendance.answersUntilTime };
    case 'poll':
      return { day: card.poll.votesUntilDay, time: card.poll.votesUntilTime };
    case 'signUpList':
      return { day: card.signUpList.signUpUntilDay, time: card.signUpList.signUpUntilTime };
  }
};

const keepsHeldDeadline = (card: AnnouncementAddOnCardForm | undefined): boolean => {
  if (card === undefined || card.kind === 'borrowed') {
    return false;
  }

  const held = toHeldDeadline(card);

  return held !== null && toDeadlineInstant({ ...toDeadlineFieldsOf(card), held }) === held;
};

const isRaised = (
  issue: AnnouncementAddOnIssue,
  cards: readonly AnnouncementAddOnCardForm[],
): boolean => {
  const cardIndex = issue.path[1];

  return (
    issue.code !== 'deadlineAfterStart' ||
    typeof cardIndex !== 'number' ||
    !keepsHeldDeadline(cards[cardIndex])
  );
};

export const toAnnouncementAddOnIssues = (
  cards: readonly AnnouncementAddOnCardForm[],
  validUntil: string | null,
): AnnouncementAddOnIssue[] => {
  const start = toAnnouncementDeadlineStart(validUntil);

  const issues: AnnouncementAddOnIssue[] = [
    ...toAttendanceIssues(cards, start),
    ...toPollIssues(cards, start).map(
      (issue): AnnouncementAddOnIssue => ({ addOn: 'poll', ...issue }),
    ),
    ...toSignUpListIssues(cards, start).map(
      (issue): AnnouncementAddOnIssue => ({ addOn: 'signUpList', ...issue }),
    ),
  ];

  return issues.filter((issue) => isRaised(issue, cards));
};

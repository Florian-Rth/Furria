import { describe, expect, it } from 'vitest';
import type { CalendarSignUpListIssueCode } from './calendar-sign-up-lists';
import {
  toSignUpLineRows,
  toSignUpListForm,
  toSignUpListIssues,
  toSignUpListPayload,
} from './calendar-sign-up-lists';
import type {
  CalendarAddOnCardForm,
  CalendarSignUpLine,
  CalendarSignUpList,
  CalendarSignUpListForm,
} from './schemas';

const line = (
  lineId: number,
  byViewer: boolean,
  text: string | null = null,
): CalendarSignUpLine => ({
  lineId,
  personId: lineId * 10,
  firstName: 'Anna',
  lastName: 'Bauer',
  text,
  byViewer,
});

const list = (overrides: Partial<CalendarSignUpList>): CalendarSignUpList => ({
  signUpListId: 3,
  title: 'Wer bringt was?',
  hint: null,
  signUpUntil: null,
  closedAt: null,
  closedByFirstName: null,
  closedByLastName: null,
  isClosed: false,
  lines: [],
  concernedCount: null,
  notAnswered: null,
  reminder: null,
  ...overrides,
});

const listForm = (overrides: Partial<CalendarSignUpListForm>): CalendarSignUpListForm => ({
  signUpListId: null,
  title: 'Wer bringt was?',
  hint: '',
  signUpUntilDay: '',
  signUpUntilTime: '',
  heldSignUpUntil: null,
  ...overrides,
});

const card = (overrides: Partial<CalendarSignUpListForm>): CalendarAddOnCardForm => ({
  key: 'k1',
  kind: 'signUpList',
  signUpList: listForm(overrides),
});

const START = { day: '2027-02-10', time: '19:00' };

describe('toSignUpListIssues', () => {
  it.each<[string, Partial<CalendarSignUpListForm>, CalendarSignUpListIssueCode[]]>([
    ['a deadline day without time', { signUpUntilDay: '2027-02-09' }, ['deadlineTimeMissing']],
  ])('finds for %s %j', (_case, overrides, expected) => {
    expect(toSignUpListIssues([card(overrides)], START).map((issue) => issue.code)).toEqual(
      expected,
    );
  });
});

describe('sign-up list round trip', () => {
  it.each([['2027-02-09T17:30:00.000Z']])(
    'carries a held list with deadline %s back out unchanged',
    (signUpUntil) => {
      const held = list({ hint: 'Bitte Kuchen', signUpUntil });

      expect(toSignUpListPayload(toSignUpListForm(held))).toEqual({
        signUpListId: 3,
        title: 'Wer bringt was?',
        hint: 'Bitte Kuchen',
        signUpUntil,
      });
    },
  );
});

describe('toSignUpLineRows', () => {
  it.each<[string, boolean, boolean, [boolean, boolean]]>([
    ['an editor on an open list', true, false, [false, true]],
    ['an editor on a closed list', true, true, [true, true]],
    ['a member on a closed list', false, true, [false, false]],
  ])('lets %s remove own, foreign %j', (_case, mayModerate, isClosed, expected) => {
    const rows = toSignUpLineRows(
      list({ isClosed, lines: [line(1, true), line(2, false)] }),
      mayModerate,
    );

    expect(rows.map((row) => row.canRemove)).toEqual(expected);
  });
});

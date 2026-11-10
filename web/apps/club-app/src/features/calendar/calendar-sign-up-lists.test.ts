import { describe, expect, it } from 'vitest';
import type { CalendarSignUpListIssueCode } from './calendar-sign-up-lists';
import {
  toLineText,
  toOwnLineState,
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
  isClosed: false,
  lines: [],
  concernedCount: null,
  notAnswered: null,
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
    ['a titled list', {}, []],
    ['a blank title', { title: '   ' }, ['titleMissing']],
    ['a title over the limit', { title: 'x'.repeat(121) }, ['titleTooLong']],
    ['a hint over the limit', { hint: 'x'.repeat(301) }, ['hintTooLong']],
    ['a deadline day without time', { signUpUntilDay: '2027-02-09' }, ['deadlineTimeMissing']],
  ])('finds for %s %j', (_case, overrides, expected) => {
    expect(toSignUpListIssues([card(overrides)], START).map((issue) => issue.code)).toEqual(
      expected,
    );
  });

  it('points each issue at its card', () => {
    const cards: CalendarAddOnCardForm[] = [
      { key: 'attendance', kind: 'attendance' },
      card({ title: '' }),
    ];

    expect(toSignUpListIssues(cards, START).map((issue) => issue.path)).toEqual([
      ['addOns', 1, 'signUpList', 'title'],
    ]);
  });
});

describe('sign-up list round trip', () => {
  it.each([[null], ['2027-02-09T17:30:00.000Z']])(
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

  it('trims what was typed and sends a blank hint as none', () => {
    const payload = toSignUpListPayload(listForm({ title: '  Kuchen ', hint: '   ' }));

    expect([payload.title, payload.hint]).toEqual(['Kuchen', null]);
  });
});

describe('toLineText', () => {
  it.each([
    ['', null],
    ['   ', null],
    [' Kuchen ', 'Kuchen'],
  ])('reads %j as %j', (draft, expected) => {
    expect(toLineText(draft)).toBe(expected);
  });
});

describe('toOwnLineState', () => {
  it.each<[string, CalendarSignUpList, string, [boolean, boolean, boolean, boolean]]>([
    ['no line yet, empty draft', list({}), '', [true, false, true, false]],
    ['no line yet, typed draft', list({}), 'Kuchen', [true, false, true, false]],
    [
      'own line, unchanged draft',
      list({ lines: [line(1, true, 'Kuchen')] }),
      ' Kuchen ',
      [true, true, false, false],
    ],
    [
      'own line, changed draft',
      list({ lines: [line(1, true, 'Kuchen')] }),
      'Salat',
      [true, true, true, false],
    ],
    [
      'own empty line, blank draft',
      list({ lines: [line(1, true)] }),
      '  ',
      [true, true, false, false],
    ],
    [
      'someone else signed up',
      list({ lines: [line(1, false, 'Salat')] }),
      '',
      [true, false, true, false],
    ],
    [
      'a closed list',
      list({ isClosed: true, lines: [line(1, true)] }),
      'Salat',
      [false, true, false, false],
    ],
    ['a draft over the limit', list({}), 'x'.repeat(121), [true, false, false, true]],
  ])('for %s gives open, line, save, too long %j', (_case, held, draft, expected) => {
    const state = toOwnLineState(held, draft);

    expect([state.isOpen, state.hasLine, state.canSave, state.isTooLong]).toEqual(expected);
  });
});

describe('toSignUpLineRows', () => {
  it.each<[string, boolean, boolean, [boolean, boolean]]>([
    ['a member on an open list', false, false, [false, false]],
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

  it('keeps the sign-up order and marks the viewer line', () => {
    const rows = toSignUpLineRows(list({ lines: [line(4, false), line(2, true)] }), false);

    expect(rows.map((row) => [row.lineId, row.byViewer])).toEqual([
      [4, false],
      [2, true],
    ]);
  });
});

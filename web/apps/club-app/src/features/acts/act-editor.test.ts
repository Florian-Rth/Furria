import { describe, expect, it } from 'vitest';
import type { CatalogueAct } from '@/features/running-order/schemas';
import type { ActDraft } from './act-editor';
import {
  actBodyOf,
  draftOfAct,
  editorStateOf,
  nameIssueOf,
  newActDraft,
  withGroup,
  withoutWish,
  withWish,
} from './act-editor';

const act: CatalogueAct = {
  actId: 4,
  name: 'Showtanz',
  kind: 'dance',
  group: { groupId: 1, name: 'Garde', tone: null, icon: null, picture: null },
  archived: false,
  cast: [],
  added: [{ personId: 9, firstName: 'Zoe', lastName: 'Gast', portrait: null }],
  removed: [{ personId: 2, firstName: 'Ben', lastName: 'Narr', portrait: null }],
  wishes: [
    { actWishId: 1, actId: 4, kind: 'late', strength: 'prefer' },
    { actWishId: 2, actId: 4, kind: 'first', strength: 'must' },
  ],
};

const members = [
  { personId: 1, firstName: 'Anna', lastName: 'Narr', portrait: null },
  { personId: 2, firstName: 'Ben', lastName: 'Narr', portrait: null },
];

describe('nameIssueOf', () => {
  it.each([
    ['', 'missing'],
    ['   ', 'missing'],
    ['Showtanz', null],
    ['x'.repeat(81), 'tooLong'],
    [` ${'x'.repeat(80)} `, null],
  ])('%j → %s', (name, expected) => {
    expect(nameIssueOf(name)).toBe(expected);
  });
});

describe('editorStateOf', () => {
  const initial = draftOfAct(act);

  it.each<[string, ActDraft, boolean, { dirty: boolean; canSave: boolean }]>([
    ['unchanged', initial, false, { dirty: false, canSave: false }],
    [
      'only trailing blanks',
      { ...initial, name: 'Showtanz  ' },
      false,
      { dirty: false, canSave: false },
    ],
    ['renamed', { ...initial, name: 'Gardetanz' }, false, { dirty: true, canSave: true }],
    ['emptied', { ...initial, name: '' }, false, { dirty: true, canSave: false }],
    [
      'same cast in another order',
      { ...initial, cast: { removedIds: [2], added: [...initial.cast.added] } },
      false,
      { dirty: false, canSave: false },
    ],
    [
      'wish strength changed',
      withWish(initial, 'late', 'must'),
      false,
      { dirty: true, canSave: true },
    ],
  ])('%s', (_label, draft, isNew, expected) => {
    const state = editorStateOf(initial, draft, isNew);

    expect({ dirty: state.dirty, canSave: state.canSave }).toEqual(expected);
  });

  it('lets a named new act be saved', () => {
    const blank = newActDraft(null);

    expect(editorStateOf(blank, { ...blank, name: 'Tombola' }, true).canSave).toBe(true);
    expect(editorStateOf(blank, blank, true).canSave).toBe(false);
  });
});

describe('withWish / withoutWish', () => {
  it('keeps one wish per kind in the wish order', () => {
    const draft = withWish(withWish(draftOfAct(act), 'early', 'must'), 'first', 'prefer');

    expect(draft.wishes).toEqual([
      { kind: 'first', strength: 'prefer' },
      { kind: 'early', strength: 'must' },
      { kind: 'late', strength: 'prefer' },
    ]);
    expect(withoutWish(draft, 'early').wishes.map((wish) => wish.kind)).toEqual(['first', 'late']);
  });
});

describe('withGroup', () => {
  it('drops the left-out members when the group changes and keeps the added people', () => {
    const draft = withGroup(draftOfAct(act), null);

    expect(draft.groupId).toBeNull();
    expect(draft.cast.removedIds).toEqual([]);
    expect(draft.cast.added.map((person) => person.personId)).toEqual([9]);
  });
});

describe('actBodyOf', () => {
  it('builds the request body from the draft', () => {
    expect(actBodyOf({ ...draftOfAct(act), name: ' Showtanz ' }, members)).toEqual({
      name: 'Showtanz',
      groupId: 1,
      kind: 'dance',
      addedPersonIds: [9],
      removedPersonIds: [2],
      wishes: [
        { kind: 'first', strength: 'must' },
        { kind: 'late', strength: 'prefer' },
      ],
    });
  });
});

import { describe, expect, it } from 'vitest';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { draftOfAct, editorStateOf } from './act-editor';

const act: CatalogueAct = {
  actId: 4,
  name: 'Showtanz',
  kind: 'dance',
  group: { groupId: 1, name: 'Garde', tone: null, icon: null, picture: null },
  sessionYear: 2026,
  closed: false,
  archived: false,
  cast: [],
  wishes: [
    { actWishId: 1, actId: 4, kind: 'late', strength: 'prefer' },
    { actWishId: 2, actId: 4, kind: 'first', strength: 'must' },
  ],
};

describe('editorStateOf', () => {
  const initial = draftOfAct(act);

  it('never saves an act whose session has ended', () => {
    expect(editorStateOf(initial, { ...initial, name: 'Gardetanz' }, false, true).canSave).toBe(
      false,
    );
  });
});

import { describe, expect, it } from 'vitest';
import { parseWriteDraft } from './write-draft';

describe('parseWriteDraft', () => {
  it.each([
    { label: 'nothing was kept', raw: null, expected: null },
    { label: 'the stored text is no JSON', raw: '{broken', expected: null },
    { label: 'the stored draft has no owner', raw: '{"values":{"title":"Umzug"}}', expected: null },
    {
      label: 'the draft belongs to another account',
      raw: '{"accountId":8,"values":{"title":"Umzug"}}',
      expected: null,
    },
    {
      label: 'the draft belongs to the signed-in account',
      raw: '{"accountId":7,"values":{"title":"Umzug","seats":[1,2]}}',
      expected: { title: 'Umzug', seats: [1, 2] },
    },
  ])('reads the kept draft when $label', ({ raw, expected }) => {
    expect(parseWriteDraft(raw, 7)).toEqual(expected);
  });
});

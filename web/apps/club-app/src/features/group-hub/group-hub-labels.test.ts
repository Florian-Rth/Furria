import { describe, expect, it } from 'vitest';
import { toGroupSettingsPayload, toSearchTerm } from './group-hub-labels';

describe('toGroupSettingsPayload', () => {
  it('turns the empty choices into nulls and the year into a number', () => {
    expect(
      toGroupSettingsPayload(
        {
          name: 'Tanzgarde',
          description: 'Die Garde tanzt.',
          isRecruiting: true,
          isManagementGroup: false,
          groupKindId: '',
          foundedYear: '',
          tone: '',
          icon: null,
        },
        false,
      ),
    ).toEqual({
      name: null,
      description: 'Die Garde tanzt.',
      isRecruiting: true,
      isManagementGroup: null,
      groupKindId: null,
      foundedYear: null,
      tone: null,
      icon: null,
    });
  });
});

describe('toSearchTerm', () => {
  it.each([
    { raw: ' b ', expected: null },
    { raw: 'x'.repeat(200), expected: 'x'.repeat(64) },
  ])('turns $raw into the term the server accepts', ({ raw, expected }) => {
    expect(toSearchTerm(raw)).toBe(expected);
  });
});

import { describe, expect, it } from 'vitest';
import { toggledGroupIds, toIntakeDecision, toIntakeFormDefaults } from './intake-decision';
import type { IntakeSummary } from './schemas';

const TODAY = '2026-11-19';

const existing: IntakeSummary = {
  intakeId: 7,
  state: 'open',
  label: 'Mia',
  newcomer: null,
  memberFrom: null,
  groups: [{ groupId: 4, name: 'Kindergarde' }],
  startedBy: null,
  canManage: true,
  createdAt: '2026-11-18T10:00:00+00:00',
  expiresAt: '2026-11-25T10:00:00+00:00',
  submittedAt: null,
  completedAt: null,
  discardedAt: null,
};

describe('toIntakeDecision', () => {
  it('drops the member date when she does not become a member and blanks an empty label', () => {
    expect(
      toIntakeDecision({ isMember: false, memberFrom: TODAY, groupIds: ['4', '5'], label: '  ' }),
    ).toEqual({ memberFrom: null, groupIds: [4, 5], label: null });
  });

  it('keeps the member date and the trimmed label', () => {
    expect(
      toIntakeDecision({ isMember: true, memberFrom: '2027-01-01', groupIds: [], label: ' Mia ' }),
    ).toEqual({ memberFrom: '2027-01-01', groupIds: [], label: 'Mia' });
  });
});

describe('toIntakeFormDefaults', () => {
  it.each([
    [true, null, { isMember: true, memberFrom: TODAY, groupIds: [], label: '' }],
    [true, 4, { isMember: false, memberFrom: TODAY, groupIds: ['4'], label: '' }],
    [false, 4, { isMember: false, memberFrom: TODAY, groupIds: ['4'], label: '' }],
  ] as const)(
    'starts a new intake (manager %s, preset group %s)',
    (managesPersons, presetGroupId, expected) => {
      expect(
        toIntakeFormDefaults({ intake: null, presetGroupId, managesPersons, today: TODAY }),
      ).toEqual(expected);
    },
  );

  it('takes over the decision of an existing intake', () => {
    expect(
      toIntakeFormDefaults({
        intake: existing,
        presetGroupId: null,
        managesPersons: true,
        today: TODAY,
      }),
    ).toEqual({ isMember: false, memberFrom: TODAY, groupIds: ['4'], label: 'Mia' });
  });
});

describe('toIntakeFormDefaults for a member intake', () => {
  it('keeps her member date', () => {
    expect(
      toIntakeFormDefaults({
        intake: { ...existing, memberFrom: '2027-01-01', groups: [], label: null },
        presetGroupId: null,
        managesPersons: true,
        today: TODAY,
      }),
    ).toEqual({ isMember: true, memberFrom: '2027-01-01', groupIds: [], label: '' });
  });
});

describe('toggledGroupIds', () => {
  it.each([
    [['1', '2'], '2', ['1']],
    [['1'], '2', ['1', '2']],
  ])('toggles a group', (groupIds, groupId, expected) => {
    expect(toggledGroupIds(groupIds, groupId)).toEqual(expected);
  });
});

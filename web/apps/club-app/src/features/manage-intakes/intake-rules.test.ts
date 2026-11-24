import { describe, expect, it } from 'vitest';
import type { IntakeRights } from './intake-rules';
import {
  toGroupChoices,
  toIntakeActions,
  toIntakeScreenGate,
  toPresetGroupId,
} from './intake-rules';
import type { IntakeState, IntakeSummary } from './schemas';

const intakeOf = (
  intakeId: number,
  state: IntakeState,
  overrides: Partial<IntakeSummary> = {},
): IntakeSummary => ({
  intakeId,
  state,
  label: null,
  newcomer: null,
  memberFrom: null,
  groups: [],
  startedBy: null,
  canManage: true,
  createdAt: '2026-11-10T10:00:00+00:00',
  expiresAt: '2026-11-17T10:00:00+00:00',
  submittedAt: null,
  completedAt: null,
  discardedAt: null,
  ...overrides,
});

const MANAGER: IntakeRights = { managesPersons: true, administeredGroupIds: [] };
const TRAINER: IntakeRights = { managesPersons: false, administeredGroupIds: [1] };

describe('toIntakeActions', () => {
  it.each([
    [
      'open',
      'token',
      {
        canEdit: true,
        canRenew: true,
        canDiscard: true,
        canResolve: false,
        showsLink: true,
        renewVoidsLink: true,
      },
    ],
    [
      'needsReview',
      null,
      {
        canEdit: false,
        canRenew: false,
        canDiscard: true,
        canResolve: true,
        showsLink: false,
        renewVoidsLink: false,
      },
    ],
  ] as const)('offers the right actions for a %s intake', (state, token, expected) => {
    expect(toIntakeActions(intakeOf(1, state), token)).toEqual(expected);
  });

  it('offers nothing to someone who neither started nor manages it', () => {
    const actions = toIntakeActions(intakeOf(1, 'open', { canManage: false }), 'token');

    expect(actions).toEqual({
      canEdit: false,
      canRenew: false,
      canDiscard: false,
      canResolve: false,
      showsLink: false,
      renewVoidsLink: true,
    });
  });
});

describe('toGroupChoices', () => {
  const groups = [
    { groupId: 2, name: 'Tanzgarde' },
    { groupId: 1, name: 'Kindergarde' },
    { groupId: 3, name: 'Elferrat' },
  ];

  it('lets a group admin choose only the groups she runs and locks foreign chosen ones', () => {
    const choices = toGroupChoices(groups, TRAINER, [{ groupId: 2, name: 'Tanzgarde' }]);

    expect(choices).toEqual([
      { groupId: 1, name: 'Kindergarde', isLocked: false },
      { groupId: 2, name: 'Tanzgarde', isLocked: true },
    ]);
  });

  it('keeps a chosen group that is no longer listed so a manager can still remove it', () => {
    const choices = toGroupChoices([], MANAGER, [{ groupId: 9, name: 'Alte Garde' }]);

    expect(choices).toEqual([{ groupId: 9, name: 'Alte Garde', isLocked: false }]);
  });
});

describe('toPresetGroupId', () => {
  it.each([
    [1, TRAINER, 1],
    [2, TRAINER, null],
  ])('presets group %s only within the rights', (raw, rights, expected) => {
    expect(toPresetGroupId(raw, rights)).toBe(expected);
  });
});

describe('toIntakeScreenGate', () => {
  it.each([
    ['completed', true, 'edit', 'settled'],
    ['open', true, 'resolve', 'settled'],
    ['open', false, 'edit', 'denied'],
  ] as const)('gates a %s intake (manages %s) for %s', (state, canManage, need, expected) => {
    expect(
      toIntakeScreenGate({ intake: intakeOf(1, state, { canManage }), token: null }, need),
    ).toBe(expected);
  });
});

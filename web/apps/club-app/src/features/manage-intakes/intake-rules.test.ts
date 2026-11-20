import { describe, expect, it } from 'vitest';
import type { IntakeRights } from './intake-rules';
import {
  runsIntakes,
  toGroupChips,
  toGroupChoices,
  toGroupIntakes,
  toIntakeActionPlan,
  toIntakeActions,
  toIntakeCounts,
  toIntakeHome,
  toIntakeScreenGate,
  toIntakeSections,
  toPresetGroupId,
  toResultingPersonPath,
  toStartHome,
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
const NOBODY: IntakeRights = { managesPersons: false, administeredGroupIds: [] };

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
      'expired',
      null,
      {
        canEdit: true,
        canRenew: true,
        canDiscard: true,
        canResolve: false,
        showsLink: false,
        renewVoidsLink: false,
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
    [
      'completed',
      null,
      {
        canEdit: false,
        canRenew: false,
        canDiscard: false,
        canResolve: false,
        showsLink: false,
        renewVoidsLink: false,
      },
    ],
    [
      'discarded',
      null,
      {
        canEdit: false,
        canRenew: false,
        canDiscard: false,
        canResolve: false,
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

  it('shows no link while the token is missing', () => {
    expect(toIntakeActions(intakeOf(1, 'open'), null).showsLink).toBe(false);
  });
});

describe('toIntakeSections', () => {
  it('groups by state in review-first order, newest first, and drops empty sections', () => {
    const sections = toIntakeSections([
      intakeOf(1, 'open', { createdAt: '2026-11-10T10:00:00+00:00' }),
      intakeOf(2, 'completed', { completedAt: '2026-11-12T10:00:00+00:00' }),
      intakeOf(3, 'needsReview', { submittedAt: '2026-11-11T10:00:00+00:00' }),
      intakeOf(4, 'open', { createdAt: '2026-11-11T10:00:00+00:00' }),
      intakeOf(5, 'discarded', { discardedAt: '2026-11-13T10:00:00+00:00' }),
    ]);

    expect(sections.map((section) => [section.id, section.intakes.map((i) => i.intakeId)])).toEqual(
      [
        ['needsReview', [3]],
        ['open', [4, 1]],
        ['settled', [5, 2]],
      ],
    );
  });
});

describe('runsIntakes', () => {
  it.each([
    [MANAGER, true],
    [TRAINER, true],
    [NOBODY, false],
  ])('decides who runs intakes', (rights, expected) => {
    expect(runsIntakes(rights)).toBe(expected);
  });
});

describe('toGroupChoices', () => {
  const groups = [
    { groupId: 2, name: 'Tanzgarde' },
    { groupId: 1, name: 'Kindergarde' },
    { groupId: 3, name: 'Elferrat' },
  ];

  it('lets a manager choose every group, sorted by name', () => {
    expect(toGroupChoices(groups, MANAGER, []).map((choice) => choice.groupId)).toEqual([3, 1, 2]);
  });

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
    [2, MANAGER, 2],
    [null, MANAGER, null],
  ])('presets group %s only within the rights', (raw, rights, expected) => {
    expect(toPresetGroupId(raw, rights)).toBe(expected);
  });
});

describe('toIntakeActionPlan', () => {
  it.each([
    ['needsReview', null, 'review'],
    ['open', 'token', 'shareAndRenew'],
    ['open', null, 'renew'],
    ['expired', null, 'renew'],
    ['completed', null, 'none'],
  ] as const)('plans the actions of a %s intake (token %s)', (state, token, expected) => {
    expect(toIntakeActionPlan(toIntakeActions(intakeOf(1, state), token))).toBe(expected);
  });
});

describe('toIntakeScreenGate', () => {
  it.each([
    ['open', true, 'edit', 'open'],
    ['completed', true, 'edit', 'settled'],
    ['needsReview', true, 'resolve', 'open'],
    ['open', true, 'resolve', 'settled'],
    ['open', false, 'edit', 'denied'],
  ] as const)('gates a %s intake (manages %s) for %s', (state, canManage, need, expected) => {
    expect(
      toIntakeScreenGate({ intake: intakeOf(1, state, { canManage }), token: null }, need),
    ).toBe(expected);
  });

  it('waits while the intake is not loaded', () => {
    expect(toIntakeScreenGate(undefined, 'edit')).toBe('pending');
  });
});

describe('toResultingPersonPath', () => {
  it.each([
    [true, '/manage/persons/5'],
    [false, '/members/5'],
  ])('links a manager (%s) to the right person screen', (managesPersons, expected) => {
    expect(toResultingPersonPath(5, managesPersons)).toBe(expected);
  });
});

describe('toGroupChips', () => {
  it('offers only unlocked groups and tells that locked ones exist', () => {
    expect(
      toGroupChips([
        { groupId: 1, name: 'Kindergarde', isLocked: false },
        { groupId: 2, name: 'Tanzgarde', isLocked: true },
      ]),
    ).toEqual({ chips: [{ id: '1', label: 'Kindergarde' }], hasLocked: true });
  });
});

describe('toIntakeHome', () => {
  const guard = { groupId: 4, name: 'Kindergarde' };

  it.each([
    [true, [guard], { kind: 'overview' }],
    [false, [guard], { kind: 'group', groupId: 4, name: 'Kindergarde' }],
    [false, [], { kind: 'overview' }],
  ] as const)('sends a manager (%s) home', (managesPersons, groups, expected) => {
    expect(toIntakeHome(groups, managesPersons)).toEqual(expected);
  });

  it('starts from the preset group even for a manager', () => {
    expect(toStartHome([guard])).toEqual({ kind: 'group', groupId: 4, name: 'Kindergarde' });
  });
});

describe('toGroupIntakes', () => {
  it('keeps the undecided intakes of the group, review first', () => {
    const guard = [{ groupId: 4, name: 'Kindergarde' }];
    const intakes = [
      intakeOf(1, 'open', { groups: guard }),
      intakeOf(2, 'needsReview', { groups: guard }),
      intakeOf(3, 'completed', { groups: guard }),
      intakeOf(4, 'open', { groups: [{ groupId: 5, name: 'Tanzgarde' }] }),
    ];

    expect(toGroupIntakes(intakes, 4).map((intake) => intake.intakeId)).toEqual([2, 1]);
  });
});

describe('toIntakeCounts', () => {
  it('counts the undecided intakes apart from those waiting for review', () => {
    expect(
      toIntakeCounts([
        intakeOf(1, 'open'),
        intakeOf(2, 'completed'),
        intakeOf(3, 'needsReview'),
        intakeOf(4, 'expired'),
        intakeOf(5, 'discarded'),
      ]),
    ).toEqual({ awaitingCount: 2, needsReviewCount: 1 });
  });
});

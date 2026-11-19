import type { IntakeState, IntakeSummary } from './schemas';

export interface IntakeActions {
  canEdit: boolean;
  canRenew: boolean;
  canDiscard: boolean;
  canResolve: boolean;
  showsLink: boolean;
  renewVoidsLink: boolean;
}

export type IntakeSectionId = 'needsReview' | 'open' | 'expired' | 'settled';

export interface IntakeSection {
  id: IntakeSectionId;
  intakes: readonly IntakeSummary[];
}

export interface IntakeRights {
  managesPersons: boolean;
  administeredGroupIds: readonly number[];
}

export interface ChoosableGroup {
  groupId: number;
  name: string;
}

export interface GroupChoice {
  groupId: number;
  name: string;
  isLocked: boolean;
}

const UNDECIDED_STATES: readonly IntakeState[] = ['open', 'expired'];
const DISCARDABLE_STATES: readonly IntakeState[] = ['open', 'expired', 'needsReview'];
const SECTION_ORDER: readonly IntakeSectionId[] = ['needsReview', 'open', 'expired', 'settled'];

export const toIntakeActions = (intake: IntakeSummary, token: string | null): IntakeActions => {
  const isUndecided = UNDECIDED_STATES.includes(intake.state);
  const manages = intake.canManage;

  return {
    canEdit: manages && isUndecided,
    canRenew: manages && isUndecided,
    canDiscard: manages && DISCARDABLE_STATES.includes(intake.state),
    canResolve: manages && intake.state === 'needsReview',
    showsLink: manages && intake.state === 'open' && token !== null,
    renewVoidsLink: intake.state === 'open',
  };
};

const sectionOf = (state: IntakeState): IntakeSectionId => {
  switch (state) {
    case 'needsReview':
      return 'needsReview';
    case 'open':
      return 'open';
    case 'expired':
      return 'expired';
    case 'completed':
    case 'discarded':
      return 'settled';
  }
};

const settledAtOf = (intake: IntakeSummary): string =>
  intake.completedAt ?? intake.discardedAt ?? intake.createdAt;

const sortKeyOf = (intake: IntakeSummary): string => {
  switch (intake.state) {
    case 'needsReview':
      return intake.submittedAt ?? intake.createdAt;
    case 'open':
    case 'expired':
      return intake.createdAt;
    case 'completed':
    case 'discarded':
      return settledAtOf(intake);
  }
};

const newestFirst = (left: IntakeSummary, right: IntakeSummary): number =>
  Date.parse(sortKeyOf(right)) - Date.parse(sortKeyOf(left));

export const toIntakeSections = (intakes: readonly IntakeSummary[]): IntakeSection[] =>
  SECTION_ORDER.map((id) => ({
    id,
    intakes: intakes.filter((intake) => sectionOf(intake.state) === id).toSorted(newestFirst),
  })).filter((section) => section.intakes.length > 0);

export const runsIntakes = (rights: IntakeRights): boolean =>
  rights.managesPersons || rights.administeredGroupIds.length > 0;

export const mayDecideMembership = (rights: IntakeRights): boolean => rights.managesPersons;

export const toGroupChoices = (
  groups: readonly ChoosableGroup[],
  rights: IntakeRights,
  chosen: readonly ChoosableGroup[],
): GroupChoice[] => {
  const mayChoose = (groupId: number): boolean =>
    rights.managesPersons || rights.administeredGroupIds.includes(groupId);
  const choosable = groups
    .filter((group) => mayChoose(group.groupId))
    .map((group) => ({ groupId: group.groupId, name: group.name, isLocked: false }));
  const isListed = (groupId: number): boolean =>
    choosable.some((choice) => choice.groupId === groupId);
  const unlisted = chosen
    .filter((group) => !isListed(group.groupId))
    .map((group) => ({
      groupId: group.groupId,
      name: group.name,
      isLocked: !mayChoose(group.groupId),
    }));

  return [...choosable, ...unlisted].toSorted((left, right) =>
    left.name.localeCompare(right.name, 'de'),
  );
};

export const toPresetGroupId = (raw: number | null, rights: IntakeRights): number | null =>
  raw !== null && (rights.managesPersons || rights.administeredGroupIds.includes(raw)) ? raw : null;

export type IntakeActionPlan = 'review' | 'shareAndRenew' | 'renew' | 'none';

export type IntakeScreenNeed = 'edit' | 'resolve';

export type IntakeScreenGate = 'pending' | 'open' | 'settled' | 'denied';

export interface GroupChips {
  chips: readonly { id: string; label: string }[];
  hasLocked: boolean;
}

export const toIntakeActionPlan = (actions: IntakeActions): IntakeActionPlan => {
  if (actions.canResolve) {
    return 'review';
  }
  if (actions.showsLink) {
    return 'shareAndRenew';
  }

  return actions.canRenew ? 'renew' : 'none';
};

export const toIntakeScreenGate = (
  details: { intake: IntakeSummary; token: string | null } | undefined,
  need: IntakeScreenNeed,
): IntakeScreenGate => {
  if (details === undefined) {
    return 'pending';
  }
  if (!details.intake.canManage) {
    return 'denied';
  }

  const actions = toIntakeActions(details.intake, details.token);
  const isPossible = need === 'edit' ? actions.canEdit : actions.canResolve;

  return isPossible ? 'open' : 'settled';
};

export const isSettledIntake = (state: IntakeState): boolean =>
  state === 'completed' || state === 'discarded';

export const toResultingPersonPath = (personId: number, managesPersons: boolean): string =>
  managesPersons ? `/manage/persons/${personId}` : `/members/${personId}`;

export const toGroupChips = (choices: readonly GroupChoice[]): GroupChips => {
  const open = choices.filter((choice) => !choice.isLocked);

  return {
    chips: open.map((choice) => ({ id: String(choice.groupId), label: choice.name })),
    hasLocked: open.length < choices.length,
  };
};

export const mayStartIntakeForGroup = (viewerIsAdmin: boolean, managesPersons: boolean): boolean =>
  viewerIsAdmin || managesPersons;

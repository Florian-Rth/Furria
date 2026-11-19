import type { IntakeForm, IntakeSummary } from './schemas';

export interface IntakeDecision {
  memberFrom: string | null;
  groupIds: readonly number[];
  label: string | null;
}

export interface IntakeFormDefaultsInput {
  intake: IntakeSummary | null;
  presetGroupId: number | null;
  managesPersons: boolean;
  today: string;
}

export const toIntakeDecision = (form: IntakeForm): IntakeDecision => {
  const label = form.label.trim();

  return {
    memberFrom: form.isMember ? form.memberFrom : null,
    groupIds: form.groupIds.map(Number),
    label: label === '' ? null : label,
  };
};

export const toIntakeFormDefaults = ({
  intake,
  presetGroupId,
  managesPersons,
  today,
}: IntakeFormDefaultsInput): IntakeForm => {
  if (intake !== null) {
    return {
      isMember: intake.memberFrom !== null,
      memberFrom: intake.memberFrom ?? today,
      groupIds: intake.groups.map((group) => String(group.groupId)),
      label: intake.label ?? '',
    };
  }

  return {
    isMember: managesPersons && presetGroupId === null,
    memberFrom: today,
    groupIds: presetGroupId === null ? [] : [String(presetGroupId)],
    label: '',
  };
};

export const toggledGroupIds = (groupIds: readonly string[], groupId: string): string[] =>
  groupIds.includes(groupId)
    ? groupIds.filter((chosen) => chosen !== groupId)
    : [...groupIds, groupId];

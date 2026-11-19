import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import type { WriteLanding } from '@/features/write/landing-target';
import { toIsoDay } from '@/lib/day';
import { useEditIntakeMutation, useStartIntakeMutation } from '../api';
import { toggledGroupIds, toIntakeDecision, toIntakeFormDefaults } from '../intake-decision';
import { INTAKE_ROUTE, toHomeOrigin, toIntakeOrigin } from '../intake-labels';
import type { ChoosableGroup, GroupChips, IntakeRights } from '../intake-rules';
import { mayDecideMembership, toGroupChips, toGroupChoices, toStartHome } from '../intake-rules';
import type { IntakeForm, IntakeSummary } from '../schemas';
import { IntakeFormSchema } from '../schemas';

export interface IntakeEditorInput {
  intake: IntakeSummary | null;
  presetGroupId: number | null;
  rights: IntakeRights;
  groups: readonly ChoosableGroup[];
}

export interface IntakeEditorControl {
  origin: KkScreenOrigin;
  decidesMembership: boolean;
  isMember: boolean;
  setIsMember: (isMember: boolean) => void;
  memberFrom: string | null;
  setMemberFrom: (memberFrom: string | null) => void;
  memberFromError: string | undefined;
  groupChips: GroupChips;
  chosenGroupIds: readonly string[];
  toggleGroup: (groupId: string) => void;
  groupsError: string | undefined;
  labelField: UseFormRegisterReturn<'label'>;
  labelError: string | undefined;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  canSubmit: boolean;
  submit: () => void;
}

const toIntakeLanding = (intakeId: number): WriteLanding => ({
  to: INTAKE_ROUTE,
  params: { intakeId },
});

export const useIntakeEditor = ({
  intake,
  presetGroupId,
  rights,
  groups,
}: IntakeEditorInput): IntakeEditorControl => {
  const startMutation = useStartIntakeMutation();
  const editMutation = useEditIntakeMutation();

  const save = (form: IntakeForm): Promise<number> => {
    const decision = toIntakeDecision(form);

    return intake === null
      ? startMutation.mutateAsync(decision).then((started) => started.intakeId)
      : editMutation
          .mutateAsync({ intakeId: intake.intakeId, decision })
          .then(() => intake.intakeId);
  };

  const write = useWriteForm({
    schema: IntakeFormSchema,
    defaults: toIntakeFormDefaults({
      intake,
      presetGroupId,
      managesPersons: rights.managesPersons,
      today: toIsoDay(new Date()),
    }),
    mutate: save,
    landing: toIntakeLanding,
  });
  const { form } = write;
  const { errors } = form.formState;
  const isMemberField = useController({ control: form.control, name: 'isMember' });
  const memberFromField = useController({ control: form.control, name: 'memberFrom' });
  const groupIdsField = useController({ control: form.control, name: 'groupIds' });
  const chosenGroupIds = groupIdsField.field.value;
  const chosenGroups = intake?.groups ?? [];

  const setIsMember = (isMember: boolean): void => {
    isMemberField.field.onChange(isMember);
    isMemberField.field.onBlur();
    void form.trigger('groupIds');
  };

  const toggleGroup = (groupId: string): void => {
    groupIdsField.field.onChange(toggledGroupIds(chosenGroupIds, groupId));
    groupIdsField.field.onBlur();
  };

  const presetGroups = groups.filter((group) => group.groupId === presetGroupId);
  const origin = intake === null ? toHomeOrigin(toStartHome(presetGroups)) : toIntakeOrigin(intake);

  return {
    origin,
    decidesMembership: mayDecideMembership(rights),
    isMember: isMemberField.field.value,
    setIsMember,
    memberFrom: memberFromField.field.value,
    setMemberFrom: memberFromField.field.onChange,
    memberFromError: errors.memberFrom?.message,
    groupChips: toGroupChips(toGroupChoices(groups, rights, chosenGroups)),
    chosenGroupIds,
    toggleGroup,
    groupsError: errors.groupIds?.message,
    labelField: form.register('label'),
    labelError: errors.label?.message,
    rejection: write.rejection,
    isSaving: write.isSaving,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    submit: write.submit,
  };
};

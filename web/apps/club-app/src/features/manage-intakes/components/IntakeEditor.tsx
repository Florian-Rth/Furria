import { KkDateField } from '@furria/ui/KkDateField';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write/WriteScreen';
import type { IntakeEditorInput } from '../hooks/use-intake-editor';
import { useIntakeEditor } from '../hooks/use-intake-editor';
import {
  EDIT_INTAKE_TITLE,
  IS_MEMBER_LABEL,
  IS_MEMBER_STATE,
  LABEL_FIELD,
  LABEL_PLACEHOLDER,
  LABEL_SECTION,
  MEMBER_FROM_LABEL,
  MEMBERSHIP_SECTION,
  NEW_INTAKE_LABEL,
  SAVE_LABEL,
  toMemberFromQuickChoices,
} from '../intake-labels';
import { INTAKE_LABEL_MAX_LENGTH } from '../schemas';
import { IntakeGroupField } from './IntakeGroupField';

export const IntakeEditor: FC<IntakeEditorInput> = (input) => {
  const control = useIntakeEditor(input);
  const isNew = input.intake === null;
  const title = isNew ? NEW_INTAKE_LABEL : EDIT_INTAKE_TITLE;
  const actionLabel = isNew ? NEW_INTAKE_LABEL : SAVE_LABEL;
  const rejection = control.rejection ?? undefined;
  const quickChoices = toMemberFromQuickChoices(new Date());

  const memberFrom = control.isMember ? (
    <KkDateField
      name="memberFrom"
      label={MEMBER_FROM_LABEL}
      value={control.memberFrom}
      onChange={control.setMemberFrom}
      quickChoices={quickChoices}
      required
      error={control.memberFromError !== undefined}
      helperText={control.memberFromError}
    />
  ) : null;

  const membership = control.decidesMembership ? (
    <KkFormSection title={MEMBERSHIP_SECTION}>
      <KkSwitchRow
        label={IS_MEMBER_LABEL}
        checked={control.isMember}
        onChange={control.setIsMember}
        stateLabel={IS_MEMBER_STATE}
      />
      {memberFrom}
    </KkFormSection>
  ) : null;

  return (
    <WriteScreen
      origin={control.origin}
      title={title}
      rejection={rejection}
      isDirty={control.isDirty}
      action={{
        primary: {
          label: actionLabel,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      <IntakeGroupField control={control} />
      {membership}
      <KkFormSection title={LABEL_SECTION}>
        <KkTextField
          name={control.labelField.name}
          label={LABEL_FIELD}
          placeholder={LABEL_PLACEHOLDER}
          maxLength={INTAKE_LABEL_MAX_LENGTH}
          error={control.labelError !== undefined}
          helperText={control.labelError}
          onChange={control.labelField.onChange}
          onBlur={control.labelField.onBlur}
          inputRef={control.labelField.ref}
        />
      </KkFormSection>
    </WriteScreen>
  );
};

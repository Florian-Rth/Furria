import type { KkScreenActionContext } from '@furria/ui';
import { KkCheckboxRow, KkDateField, KkNote } from '@furria/ui';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import {
  ADMISSION_ACTION_LABEL,
  ADMITTED_ON_LABEL,
  GUARDIAN_CONSENT_LABEL,
  toAdmissionQuickChoices,
  toAdmittedOnHint,
  toGapNote,
  toGuardianConsentDescription,
} from '../admission-labels';
import { useAdmissionEditor } from '../hooks/use-admission-editor';
import { toApplicationOrigin } from '../manage-membership-applications-labels';
import type { MembershipApplicationDetails } from '../schemas';
import { AdmissionCandidateChoice } from './AdmissionCandidateChoice';

interface AdmissionEditorProps {
  application: MembershipApplicationDetails;
}

export const AdmissionEditor: FC<AdmissionEditorProps> = ({ application }) => {
  const control = useAdmissionEditor(application);
  const quickChoices = toAdmissionQuickChoices(new Date());
  const admittedOnHint = toAdmittedOnHint(application.appliedOn);
  const origin = toApplicationOrigin(application);
  const rejection = control.rejection ?? undefined;
  const context: KkScreenActionContext | undefined =
    control.consequence === null ? undefined : { text: control.consequence, tone: 'consequence' };
  const gapLine = control.chosenCandidate === null ? null : toGapNote(control.chosenCandidate);
  const consentDescription =
    control.admittedOn === null || !control.needsConsent
      ? null
      : toGuardianConsentDescription(application, control.admittedOn);

  const gapNote = gapLine === null ? null : <KkNote tone="muted">{gapLine}</KkNote>;

  const guardianConsent =
    consentDescription === null ? null : (
      <KkCheckboxRow
        label={GUARDIAN_CONSENT_LABEL}
        description={consentDescription}
        checked={control.guardianConsentConfirmed}
        onChange={control.setGuardianConsentConfirmed}
      />
    );

  return (
    <WriteScreen
      origin={origin}
      title={ADMISSION_ACTION_LABEL}
      rejection={rejection}
      isDirty={control.isDirty}
      action={{
        context,
        primary: {
          label: ADMISSION_ACTION_LABEL,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      <AdmissionCandidateChoice
        application={application}
        choice={control.choice}
        onChoose={control.setChoice}
      />
      {gapNote}
      <KkDateField
        name="admittedOn"
        label={ADMITTED_ON_LABEL}
        value={control.admittedOn}
        onChange={control.setAdmittedOn}
        quickChoices={quickChoices}
        required
        error={control.admittedOnError !== undefined}
        helperText={control.admittedOnError}
        hint={admittedOnHint}
      />
      {guardianConsent}
    </WriteScreen>
  );
};

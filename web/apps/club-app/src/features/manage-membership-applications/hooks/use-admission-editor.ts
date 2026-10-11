import { useKkNotice } from '@furria/ui';
import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write';
import { toIsoDay } from '@/lib/day';
import { isNotFoundError } from '@/lib/query-error';
import {
  findChosenCandidate,
  NEW_PERSON_CHOICE,
  needsGuardianConsent,
  toAdmissionRequest,
  toInitialChoice,
  toInvitationForecast,
} from '../admission';
import { toAdmissionConsequence } from '../admission-labels';
import { useAdmitMembershipApplicationMutation, useForgetMembershipApplication } from '../api';
import {
  ALREADY_DECIDED_MESSAGE,
  APPLICATIONS_PATH,
  toApplicantName,
} from '../manage-membership-applications-labels';
import type { AdmissionCandidate, MembershipApplicationDetails } from '../schemas';
import { AdmissionFormSchema } from '../schemas';

export interface AdmissionEditorControl {
  choice: string | null;
  setChoice: (choice: string) => void;
  chosenCandidate: AdmissionCandidate | null;
  admittedOn: string | null;
  setAdmittedOn: (admittedOn: string | null) => void;
  admittedOnError: string | undefined;
  needsConsent: boolean;
  guardianConsentConfirmed: boolean;
  setGuardianConsentConfirmed: (confirmed: boolean) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  canSubmit: boolean;
  submit: () => void;
}

export const useAdmissionEditor = (
  application: MembershipApplicationDetails,
): AdmissionEditorControl => {
  const today = toIsoDay(new Date());
  const mutation = useAdmitMembershipApplicationMutation();
  const forgetApplication = useForgetMembershipApplication();
  const raiseNotice = useKkNotice();

  const noticeAlreadyDecided = (error: Error): void => {
    if (!isNotFoundError(error)) {
      throw error;
    }

    raiseNotice({ tone: 'info', message: ALREADY_DECIDED_MESSAGE });
  };

  const write = useWriteForm({
    schema: AdmissionFormSchema,
    defaults: {
      choice: toInitialChoice(application.candidates),
      admittedOn: today,
      guardianConsentConfirmed: false,
      appliedOn: application.appliedOn,
      birthDate: application.birthDate,
    },
    mutate: (submitted) => {
      const request = toAdmissionRequest(submitted);

      return request === null
        ? null
        : mutation
            .mutateAsync({
              membershipApplicationId: application.membershipApplicationId,
              applicantName: toApplicantName(application),
              request,
            })
            .then(() => undefined, noticeAlreadyDecided);
    },
    landing: () => ({ to: APPLICATIONS_PATH }),
    onLanded: () => {
      forgetApplication(application.membershipApplicationId);
    },
  });
  const { form } = write;
  const { errors } = form.formState;
  const choiceField = useController({ control: form.control, name: 'choice' });
  const admittedOnField = useController({ control: form.control, name: 'admittedOn' });
  const consentField = useController({ control: form.control, name: 'guardianConsentConfirmed' });
  const choice = choiceField.field.value;
  const admittedOn = admittedOnField.field.value;
  const chosenCandidate = findChosenCandidate(choice, application.candidates);
  const isChosen = choice === NEW_PERSON_CHOICE || chosenCandidate !== null;

  const setChoice = (nextChoice: string): void => {
    choiceField.field.onChange(nextChoice);
    choiceField.field.onBlur();
  };

  const setGuardianConsentConfirmed = (confirmed: boolean): void => {
    consentField.field.onChange(confirmed);
    consentField.field.onBlur();
  };

  const consequence =
    admittedOn === null || !isChosen
      ? null
      : toAdmissionConsequence({
          application,
          candidate: chosenCandidate,
          admittedOn,
          today,
          invitation: toInvitationForecast({
            application,
            candidate: chosenCandidate,
            admittedOn,
            today,
          }),
        });

  return {
    choice,
    setChoice,
    chosenCandidate,
    admittedOn,
    setAdmittedOn: admittedOnField.field.onChange,
    admittedOnError: errors.admittedOn?.message,
    needsConsent: admittedOn !== null && needsGuardianConsent(application.birthDate, admittedOn),
    guardianConsentConfirmed: consentField.field.value,
    setGuardianConsentConfirmed,
    consequence,
    rejection: write.rejection,
    isSaving: write.isSaving,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    submit: write.submit,
  };
};

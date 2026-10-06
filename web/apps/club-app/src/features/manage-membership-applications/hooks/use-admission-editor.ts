import { useKkNotice } from '@furria/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { toIsoDay } from '@/lib/day';
import { isNotFoundError } from '@/lib/query-error';
import { toWriteErrorMessage } from '@/lib/write-error';
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
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useAdmitMembershipApplicationMutation();
  const forgetApplication = useForgetMembershipApplication();
  const raiseNotice = useKkNotice();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(AdmissionFormSchema),
    defaultValues: {
      choice: toInitialChoice(application.candidates),
      admittedOn: today,
      guardianConsentConfirmed: false,
      appliedOn: application.appliedOn,
      birthDate: application.birthDate,
    },
    mode: 'onTouched',
  });
  const { isDirty, isValid, errors } = form.formState;
  const choiceField = useController({ control: form.control, name: 'choice' });
  const admittedOnField = useController({ control: form.control, name: 'admittedOn' });
  const consentField = useController({ control: form.control, name: 'guardianConsentConfirmed' });
  const choice = choiceField.field.value;
  const admittedOn = admittedOnField.field.value;
  const chosenCandidate = findChosenCandidate(choice, application.candidates);
  const isChosen = choice === NEW_PERSON_CHOICE || chosenCandidate !== null;

  const leave = (): void => {
    void navigate({ to: APPLICATIONS_PATH, replace: true, ignoreBlocker: true }).then(() => {
      forgetApplication(application.membershipApplicationId);
    });
  };

  const fail = (error: Error): void => {
    if (isNotFoundError(error)) {
      raiseNotice({ tone: 'info', message: ALREADY_DECIDED_MESSAGE });
      leave();
      return;
    }

    setRejection(toWriteErrorMessage(error));
  };

  const handleFormSubmit = form.handleSubmit((submitted) => {
    const request = toAdmissionRequest(submitted);
    if (request === null) {
      return;
    }

    setRejection(null);
    mutation.mutate(
      {
        membershipApplicationId: application.membershipApplicationId,
        applicantName: toApplicantName(application),
        request,
      },
      { onSuccess: leave, onError: fail },
    );
  });

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
    rejection,
    isSaving: mutation.isPending,
    isDirty,
    canSubmit: isValid,
    submit: () => {
      void handleFormSubmit();
    },
  };
};

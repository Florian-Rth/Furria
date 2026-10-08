import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { SiteFormFallback } from '@/components/SiteForm/site-form-types';
import { useClubAgeOfConsent } from '@/lib/public-club/use-club-age-of-consent';
import { useClubEmail } from '@/lib/public-club/use-club-email';
import { usePreparedMembershipAltchaProof, useSubmitMembershipApplicationMutation } from '../api';
import { applyFallbackLabel, applyFallbackLead } from '../apply-content';
import type { ApplyFailure } from '../apply-failure';
import { toApplyFailure, toApplyNotice } from '../apply-failure';
import { buildFallbackMailHref } from '../apply-fallback';
import type { ApplicantStanding, DerivedMembership } from '../membership-derivation';
import { deriveApplicantStanding, deriveMembership } from '../membership-derivation';
import type { MembershipApplicationForm } from '../schemas';
import { buildMembershipApplicationFormSchema, EMPTY_MEMBERSHIP_APPLICATION } from '../schemas';

export interface SubmittedApplication {
  firstName: string;
  email: string;
}

export interface ApplyFormState {
  form: UseFormReturn<MembershipApplicationForm>;
  today: Date;
  derived: DerivedMembership | null;
  standing: ApplicantStanding;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  submitError: string | null;
  fallback: SiteFormFallback | null;
  submitted: SubmittedApplication | null;
}

const markFieldFailures = (
  form: UseFormReturn<MembershipApplicationForm>,
  failure: ApplyFailure | null,
): void => {
  failure?.fields.forEach((field, index) => {
    form.setError(
      field.name,
      { type: 'server', message: field.message },
      { shouldFocus: index === 0 },
    );
  });
};

export const useApplyForm = (): ApplyFormState => {
  const [today] = useState(() => new Date());
  const [submitted, setSubmitted] = useState<SubmittedApplication | null>(null);
  const ageOfConsent = useClubAgeOfConsent();
  const clubEmail = useClubEmail();
  const mutation = useSubmitMembershipApplicationMutation();

  const form = useForm<MembershipApplicationForm>({
    mode: 'onTouched',
    resolver: zodResolver(buildMembershipApplicationFormSchema(today, ageOfConsent)),
    defaultValues: EMPTY_MEMBERSHIP_APPLICATION,
  });

  usePreparedMembershipAltchaProof(
    form.formState.isDirty && !mutation.isPending && submitted === null,
  );

  const derived = deriveMembership(form.watch('birthDate'), today);

  const handleFormSubmit = form.handleSubmit((values) => {
    const application: SubmittedApplication = { firstName: values.firstName, email: values.email };

    if (values.honeypot.length > 0) {
      setSubmitted(application);
      return;
    }

    mutation.mutate(values, {
      onSuccess: () => {
        setSubmitted(application);
      },
      onError: (error) => {
        markFieldFailures(form, toApplyFailure(error));
      },
    });
  });

  const failure = toApplyFailure(mutation.error);
  const fallback: SiteFormFallback | null =
    failure?.offersMail === true && clubEmail !== null
      ? {
          lead: applyFallbackLead,
          label: applyFallbackLabel,
          href: buildFallbackMailHref(clubEmail, form.getValues()),
        }
      : null;

  return {
    form,
    today,
    derived,
    standing: deriveApplicantStanding(derived, ageOfConsent),
    submit: (event) => {
      void handleFormSubmit(event);
    },
    isSubmitting: mutation.isPending,
    submitError: toApplyNotice(failure),
    fallback,
    submitted,
  };
};

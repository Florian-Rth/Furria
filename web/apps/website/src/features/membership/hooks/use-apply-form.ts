import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { RequestBlockedError } from '@/lib/api/errors';
import { useSubmitMembershipApplicationMutation } from '../api';
import { buildFallbackMailHref } from '../apply-fallback';
import { buildMembershipApplicationPayload } from '../apply-payload';
import { selectGroupLabels, selectKnownGroupIds } from '../group-interests';
import type { DerivedMembership } from '../membership-derivation';
import { deriveMembership } from '../membership-derivation';
import type { MembershipApplicationForm } from '../schemas';
import { buildMembershipApplicationFormSchema, EMPTY_MEMBERSHIP_APPLICATION } from '../schemas';
import { selectLoadedGroups, useGroupsSource } from './use-groups-source';

export interface ApplyFormState {
  form: UseFormReturn<MembershipApplicationForm>;
  today: Date;
  derived: DerivedMembership | null;
  requiresGuardian: boolean;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  submitError: string | null;
  fallbackMailHref: string;
  submittedFirstName: string | null;
}

export const toApplyErrorMessage = (error: Error | null): string | null => {
  if (error === null) {
    return null;
  }

  if (error instanceof RequestBlockedError) {
    return 'Die Anfrage hat den Server nicht erreicht. Falls du einen Werbeblocker oder ein Schutz-Add-on nutzt, erlaube diese Seite und versuch es noch einmal.';
  }

  return 'Wir konnten den Antrag gerade nicht entgegennehmen.';
};

export const useApplyForm = (prefilledGroupInterests: string[]): ApplyFormState => {
  const [today] = useState(() => new Date());
  const [submittedFirstName, setSubmittedFirstName] = useState<string | null>(null);
  const mutation = useSubmitMembershipApplicationMutation();
  const groupsSource = useGroupsSource();
  const loadedGroups = selectLoadedGroups(groupsSource);

  const form = useForm<MembershipApplicationForm>({
    mode: 'onTouched',
    resolver: zodResolver(buildMembershipApplicationFormSchema(today)),
    defaultValues: { ...EMPTY_MEMBERSHIP_APPLICATION, groupInterests: prefilledGroupInterests },
  });

  const derived = deriveMembership(form.watch('birthDate'), today);
  const requiresGuardian = derived?.requiresGuardian === true;

  const handleFormSubmit = form.handleSubmit((values) => {
    if (values.honeypot.length > 0) {
      setSubmittedFirstName(values.firstName);
      return;
    }

    const groupInterests = selectKnownGroupIds(loadedGroups, values.groupInterests);

    mutation.mutate(
      buildMembershipApplicationPayload({ ...values, groupInterests }, requiresGuardian),
      {
        onSuccess: () => {
          setSubmittedFirstName(values.firstName);
        },
      },
    );
  });

  const submitError = toApplyErrorMessage(mutation.error);
  const values = form.getValues();
  const fallbackMailHref =
    submitError === null
      ? ''
      : buildFallbackMailHref(values, selectGroupLabels(loadedGroups, values.groupInterests));

  return {
    form,
    today,
    derived,
    requiresGuardian,
    submit: (event) => {
      void handleFormSubmit(event);
    },
    isSubmitting: mutation.isPending,
    submitError,
    fallbackMailHref,
    submittedFirstName,
  };
};

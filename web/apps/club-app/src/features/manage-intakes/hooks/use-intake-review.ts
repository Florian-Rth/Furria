import { useState } from 'react';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useResolveIntakeMutation } from '../api';
import { INTAKE_ROUTE, toResolveConsequence } from '../intake-labels';
import type { ReviewChoice } from '../intake-review';
import { toReviewResolution } from '../intake-review';
import type { IntakeReview } from '../schemas';

export interface IntakeReviewControl {
  choice: ReviewChoice | null;
  choose: (choice: string) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  canSubmit: boolean;
  submit: () => void;
}

export const useIntakeReview = (intakeId: number, review: IntakeReview): IntakeReviewControl => {
  const [choice, setChoice] = useState<ReviewChoice | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useResolveIntakeMutation();
  const goBackTo = useGoBackTo();
  const { newcomer } = review;
  const resolution = toReviewResolution(choice);

  const choose = (raw: string): void => {
    setRejection(null);
    setChoice(raw);
  };

  const submit = (): void => {
    if (resolution.kind === 'invalid') {
      return;
    }
    setRejection(null);
    void mutation
      .mutateAsync({
        intakeId,
        personId: resolution.kind === 'existingPerson' ? resolution.personId : null,
        newcomerName: `${newcomer.firstName} ${newcomer.lastName}`,
      })
      .then(
        () =>
          goBackTo({
            to: INTAKE_ROUTE,
            params: { intakeId: String(intakeId) },
            ignoreBlocker: true,
          }),
        (error: Error) => {
          setRejection(toWriteErrorMessage(error));
        },
      );
  };

  return {
    choice,
    choose,
    consequence:
      resolution.kind === 'invalid'
        ? null
        : toResolveConsequence(newcomer.firstName, resolution.kind === 'existingPerson'),
    rejection,
    isSaving: mutation.isPending,
    canSubmit: resolution.kind !== 'invalid' && !mutation.isPending,
    submit,
  };
};

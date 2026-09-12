import { useState } from 'react';
import { sessionAt } from '@/lib/club';
import { useCreateFeeReductionMutation, useUpdateFeeReductionMutation } from '../api';
import { toFeeReductionConsequence } from '../manage-persons-labels';
import { toWriteErrorMessage } from '../manage-persons-messages';
import type { FeeReductionBasis, PersonFeeReduction } from '../schemas';
import { FeeReductionBasisSchema } from '../schemas';

const DEFAULT_BASIS: FeeReductionBasis = 'minor';

interface FeeReductionEditorInput {
  personId: number;
  reduction: PersonFeeReduction | null;
  onSaved: () => void;
}

export interface FeeReductionEditorControl {
  basis: FeeReductionBasis;
  selectBasis: (value: string) => void;
  firstSessionYear: number | null;
  setFirstSessionYear: (value: number | null) => void;
  lastSessionYear: number | null;
  setLastSessionYear: (value: number | null) => void;
  currentSessionYear: number;
  consequence: string;
  rejection: string | null;
  isSaving: boolean;
  canSubmit: boolean;
  submit: () => void;
}

export const useFeeReductionEditor = ({
  personId,
  reduction,
  onSaved,
}: FeeReductionEditorInput): FeeReductionEditorControl => {
  const currentSessionYear = sessionAt(new Date()).startYear;
  const [basis, setBasis] = useState<FeeReductionBasis>(reduction?.basis ?? DEFAULT_BASIS);
  const [firstSessionYear, setFirstSessionYear] = useState<number | null>(
    reduction?.firstSessionYear ?? currentSessionYear,
  );
  const [lastSessionYear, setLastSessionYear] = useState<number | null>(
    reduction?.lastSessionYear ?? currentSessionYear,
  );
  const [rejection, setRejection] = useState<string | null>(null);
  const create = useCreateFeeReductionMutation(personId);
  const update = useUpdateFeeReductionMutation(personId);

  const isSaving = create.isPending || update.isPending;

  const fail = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  const selectBasis = (value: string): void => {
    const parsed = FeeReductionBasisSchema.safeParse(value);

    if (parsed.success) {
      setBasis(parsed.data);
    }
  };

  const submit = (): void => {
    if (firstSessionYear === null || lastSessionYear === null) {
      return;
    }

    setRejection(null);

    if (reduction === null) {
      create.mutate(
        { basis, firstSessionYear, lastSessionYear },
        { onSuccess: onSaved, onError: fail },
      );

      return;
    }

    update.mutate(
      { feeReductionId: reduction.feeReductionId, basis, firstSessionYear, lastSessionYear },
      { onSuccess: onSaved, onError: fail },
    );
  };

  return {
    basis,
    selectBasis,
    firstSessionYear,
    setFirstSessionYear,
    lastSessionYear,
    setLastSessionYear,
    currentSessionYear,
    consequence:
      firstSessionYear === null || lastSessionYear === null
        ? ''
        : toFeeReductionConsequence(basis, firstSessionYear, lastSessionYear),
    rejection,
    isSaving,
    canSubmit: firstSessionYear !== null && lastSessionYear !== null && !isSaving,
    submit,
  };
};

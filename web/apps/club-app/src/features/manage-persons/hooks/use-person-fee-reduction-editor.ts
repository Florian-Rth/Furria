import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toLandingKey } from '@/features/write';
import { sessionAt } from '@/lib/club';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateFeeReductionMutation, useUpdateFeeReductionMutation } from '../api';
import {
  ADD_FEE_REDUCTION_ACTION_LABEL,
  FEE_REDUCTION_CHANGE_LABEL,
  toFeeReductionConsequence,
} from '../manage-persons-labels';
import type { CreatedFeeReduction, FeeReductionBasis, PersonFeeReduction } from '../schemas';
import { FeeReductionBasisSchema } from '../schemas';

const DEFAULT_BASIS: FeeReductionBasis = 'minor';

interface PersonFeeReductionEditorInput {
  personId: number;
  reduction: PersonFeeReduction | null;
}

export interface PersonFeeReductionEditorControl {
  basis: FeeReductionBasis;
  selectBasis: (value: string) => void;
  firstSessionYear: number | null;
  setFirstSessionYear: (value: number | null) => void;
  lastSessionYear: number | null;
  setLastSessionYear: (value: number | null) => void;
  currentSessionYear: number;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  actionLabel: string;
  submit: () => void;
}

export const usePersonFeeReductionEditor = ({
  personId,
  reduction,
}: PersonFeeReductionEditorInput): PersonFeeReductionEditorControl => {
  const currentSessionYearValue = sessionAt(new Date()).startYear;
  const initialBasis = reduction?.basis ?? DEFAULT_BASIS;
  const initialFirst = reduction?.firstSessionYear ?? currentSessionYearValue;
  const initialLast = reduction?.lastSessionYear ?? currentSessionYearValue;

  const [basis, setBasis] = useState<FeeReductionBasis>(initialBasis);
  const [firstSessionYear, setFirstSessionYear] = useState<number | null>(initialFirst);
  const [lastSessionYear, setLastSessionYear] = useState<number | null>(initialLast);
  const [rejection, setRejection] = useState<string | null>(null);
  const create = useCreateFeeReductionMutation(personId);
  const update = useUpdateFeeReductionMutation(personId);
  const navigate = useNavigate();

  const fail = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  const landBack = (feeReductionId: number): void => {
    void navigate({
      to: '/manage/persons/$personId',
      params: { personId: String(personId) },
      search: (previous) => ({
        ...previous,
        changed: toLandingKey('feeReduction', feeReductionId),
      }),
      replace: true,
    });
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
        {
          onSuccess: (created: CreatedFeeReduction) => landBack(created.feeReductionId),
          onError: fail,
        },
      );

      return;
    }

    update.mutate(
      { feeReductionId: reduction.feeReductionId, basis, firstSessionYear, lastSessionYear },
      { onSuccess: () => landBack(reduction.feeReductionId), onError: fail },
    );
  };

  return {
    basis,
    selectBasis,
    firstSessionYear,
    setFirstSessionYear,
    lastSessionYear,
    setLastSessionYear,
    currentSessionYear: currentSessionYearValue,
    consequence:
      firstSessionYear === null || lastSessionYear === null
        ? null
        : toFeeReductionConsequence(basis, firstSessionYear, lastSessionYear),
    rejection,
    isSaving: create.isPending || update.isPending,
    isDirty:
      basis !== initialBasis ||
      firstSessionYear !== initialFirst ||
      lastSessionYear !== initialLast,
    actionLabel: reduction === null ? ADD_FEE_REDUCTION_ACTION_LABEL : FEE_REDUCTION_CHANGE_LABEL,
    submit,
  };
};

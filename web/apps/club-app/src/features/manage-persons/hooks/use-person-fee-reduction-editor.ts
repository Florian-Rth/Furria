import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
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
import { FeeReductionBasisSchema, FeeReductionFormSchema } from '../schemas';

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
  firstSessionYearError: string | undefined;
  lastSessionYear: number | null;
  setLastSessionYear: (value: number | null) => void;
  lastSessionYearError: string | undefined;
  currentSessionYear: number;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  canSubmit: boolean;
  actionLabel: string;
  submit: () => void;
}

export const usePersonFeeReductionEditor = ({
  personId,
  reduction,
}: PersonFeeReductionEditorInput): PersonFeeReductionEditorControl => {
  const currentSessionYearValue = sessionAt(new Date()).startYear;
  const [rejection, setRejection] = useState<string | null>(null);
  const create = useCreateFeeReductionMutation(personId);
  const update = useUpdateFeeReductionMutation(personId);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(FeeReductionFormSchema),
    defaultValues: {
      basis: reduction?.basis ?? DEFAULT_BASIS,
      firstSessionYear: reduction?.firstSessionYear ?? currentSessionYearValue,
      lastSessionYear: reduction?.lastSessionYear ?? currentSessionYearValue,
    },
    mode: 'onTouched',
  });
  const { isDirty, isValid, errors } = form.formState;
  const basis = useController({ control: form.control, name: 'basis' });
  const firstSessionYear = useController({ control: form.control, name: 'firstSessionYear' });
  const lastSessionYear = useController({ control: form.control, name: 'lastSessionYear' });

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
      basis.field.onChange(parsed.data);
    }
  };

  const handleFormSubmit = form.handleSubmit((submitted) => {
    setRejection(null);

    if (reduction === null) {
      create.mutate(submitted, {
        onSuccess: (created: CreatedFeeReduction) => landBack(created.feeReductionId),
        onError: fail,
      });

      return;
    }

    update.mutate(
      { feeReductionId: reduction.feeReductionId, ...submitted },
      { onSuccess: () => landBack(reduction.feeReductionId), onError: fail },
    );
  });

  const basisValue = basis.field.value;
  const firstValue = firstSessionYear.field.value;
  const lastValue = lastSessionYear.field.value;

  return {
    basis: basisValue,
    selectBasis,
    firstSessionYear: firstValue,
    setFirstSessionYear: firstSessionYear.field.onChange,
    firstSessionYearError: errors.firstSessionYear?.message,
    lastSessionYear: lastValue,
    setLastSessionYear: lastSessionYear.field.onChange,
    lastSessionYearError: errors.lastSessionYear?.message,
    currentSessionYear: currentSessionYearValue,
    consequence:
      firstValue === null || lastValue === null
        ? null
        : toFeeReductionConsequence(basisValue, firstValue, lastValue),
    rejection,
    isSaving: create.isPending || update.isPending,
    isDirty,
    canSubmit: isValid,
    actionLabel: reduction === null ? ADD_FEE_REDUCTION_ACTION_LABEL : FEE_REDUCTION_CHANGE_LABEL,
    submit: () => {
      void handleFormSubmit();
    },
  };
};

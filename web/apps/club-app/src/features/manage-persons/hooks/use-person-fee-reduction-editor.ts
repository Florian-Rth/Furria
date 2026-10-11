import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write';
import { sessionAt } from '@/lib/club';
import { useCreateFeeReductionMutation, useUpdateFeeReductionMutation } from '../api';
import {
  ADD_FEE_REDUCTION_ACTION_LABEL,
  FEE_REDUCTION_CHANGE_LABEL,
  toFeeReductionConsequence,
} from '../manage-persons-labels';
import type { FeeReductionBasis, PersonFeeReduction } from '../schemas';
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
  const create = useCreateFeeReductionMutation(personId);
  const update = useUpdateFeeReductionMutation(personId);

  const write = useWriteForm({
    schema: FeeReductionFormSchema,
    defaults: {
      basis: reduction?.basis ?? DEFAULT_BASIS,
      firstSessionYear: reduction?.firstSessionYear ?? currentSessionYearValue,
      lastSessionYear: reduction?.lastSessionYear ?? currentSessionYearValue,
    },
    mutate: (submitted) =>
      reduction === null
        ? create.mutateAsync(submitted).then((created) => created.feeReductionId)
        : update
            .mutateAsync({ feeReductionId: reduction.feeReductionId, ...submitted })
            .then(() => reduction.feeReductionId),
    landing: (feeReductionId) => ({
      to: '/manage/persons/$personId',
      params: { personId },
      mark: { kind: 'feeReduction', id: feeReductionId },
    }),
  });
  const { errors } = write.form.formState;
  const basis = useController({ control: write.form.control, name: 'basis' });
  const firstSessionYear = useController({ control: write.form.control, name: 'firstSessionYear' });
  const lastSessionYear = useController({ control: write.form.control, name: 'lastSessionYear' });

  const selectBasis = (value: string): void => {
    const parsed = FeeReductionBasisSchema.safeParse(value);

    if (parsed.success) {
      basis.field.onChange(parsed.data);
    }
  };

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
    rejection: write.rejection,
    isSaving: write.isSaving,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    actionLabel: reduction === null ? ADD_FEE_REDUCTION_ACTION_LABEL : FEE_REDUCTION_CHANGE_LABEL,
    submit: write.submit,
  };
};

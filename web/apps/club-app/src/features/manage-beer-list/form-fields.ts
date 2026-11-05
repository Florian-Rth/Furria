import type { FieldValues } from 'react-hook-form';
import type { WriteFormControl } from '@/features/write/hooks/use-write-form';

export interface TouchableField<TValue> {
  onChange: (value: TValue) => void;
  onBlur: () => void;
}

export const touchingChangeOf =
  <TValue>(field: TouchableField<TValue>): ((value: TValue) => void) =>
  (value) => {
    field.onChange(value);
    field.onBlur();
  };

export interface BeerWriteState {
  rejection: string | null;
  isSaving: boolean;
  canSubmit: boolean;
  submit: () => void;
}

export const writeStateOf = <TValues extends FieldValues, TSubmitted>(
  write: WriteFormControl<TValues, TSubmitted>,
): BeerWriteState => ({
  rejection: write.rejection,
  isSaving: write.isSaving,
  canSubmit: write.canSubmit && !write.isSaving,
  submit: write.submit,
});

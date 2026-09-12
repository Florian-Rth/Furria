import { KkSelectField, KkSessionField } from '@furria/ui';
import type { FC } from 'react';
import { useFeeReductionEditor } from '../hooks/use-fee-reduction-editor';
import { FEE_REDUCTION_BASIS_OPTIONS } from '../manage-persons-labels';
import type { PersonFeeReduction } from '../schemas';
import { FactEditorFrame } from './FactEditorFrame';

const ADD_TITLE = 'Ermäßigung hinzufügen';
const EDIT_TITLE = 'Ermäßigung ändern';
const ADD_CONFIRM_LABEL = 'Hinzufügen';
const EDIT_CONFIRM_LABEL = 'Ändern';
const BASIS_LABEL = 'Grundlage';
const BASIS_HINT = 'Wird angegeben, nicht aus dem Geburtsdatum abgeleitet.';
const FIRST_LABEL = 'Von Session';
const LAST_LABEL = 'Bis Session';
const LAST_HINT = 'Eine Ermäßigung läuft immer aus — danach wird der Nachweis neu gebraucht.';

interface FeeReductionEditorProps {
  personId: number;
  reduction: PersonFeeReduction | null;
  onClose: () => void;
  onSaved: () => void;
}

export const FeeReductionEditor: FC<FeeReductionEditorProps> = ({
  personId,
  reduction,
  onClose,
  onSaved,
}) => {
  const control = useFeeReductionEditor({ personId, reduction, onSaved });
  const isEdit = reduction !== null;

  return (
    <FactEditorFrame
      title={isEdit ? EDIT_TITLE : ADD_TITLE}
      consequence={control.consequence}
      rejection={control.rejection}
      confirmLabel={isEdit ? EDIT_CONFIRM_LABEL : ADD_CONFIRM_LABEL}
      isSaving={control.isSaving}
      canSubmit={control.canSubmit}
      onCancel={onClose}
      onSubmit={control.submit}
    >
      <KkSelectField
        name="basis"
        label={BASIS_LABEL}
        value={control.basis}
        options={FEE_REDUCTION_BASIS_OPTIONS}
        onChange={control.selectBasis}
        hint={BASIS_HINT}
      />
      <KkSessionField
        name="firstSessionYear"
        label={FIRST_LABEL}
        value={control.firstSessionYear}
        onChange={control.setFirstSessionYear}
        currentSessionYear={control.currentSessionYear}
      />
      <KkSessionField
        name="lastSessionYear"
        label={LAST_LABEL}
        value={control.lastSessionYear}
        onChange={control.setLastSessionYear}
        currentSessionYear={control.currentSessionYear}
        hint={LAST_HINT}
      />
    </FactEditorFrame>
  );
};

import { KkButton, KkFactRow } from '@furria/ui';
import type { FC } from 'react';
import type { FactEditor } from '../hooks/use-fact-editor';
import { toFeeReductionBasisLabel, toFeeReductionSpan } from '../manage-persons-labels';
import type { PersonFeeReduction } from '../schemas';
import { FeeReductionEditor } from './FeeReductionEditor';

const EDIT_LABEL = 'Ändern';

interface PersonFeeReductionRowProps {
  personId: number;
  reduction: PersonFeeReduction;
  editor: FactEditor;
}

export const PersonFeeReductionRow: FC<PersonFeeReductionRowProps> = ({
  personId,
  reduction,
  editor,
}) => {
  const isEditing = editor.feeReduction?.feeReductionId === reduction.feeReductionId;

  const startEdit = (): void => {
    editor.openFeeReduction(reduction.feeReductionId);
  };

  if (isEditing) {
    return (
      <FeeReductionEditor
        personId={personId}
        reduction={reduction}
        onClose={editor.close}
        onSaved={editor.close}
      />
    );
  }

  const actions = (
    <KkButton size="small" variant="outlined" onClick={startEdit}>
      {EDIT_LABEL}
    </KkButton>
  );

  return (
    <KkFactRow
      title={toFeeReductionBasisLabel(reduction.basis)}
      span={toFeeReductionSpan(reduction)}
      actions={actions}
    />
  );
};

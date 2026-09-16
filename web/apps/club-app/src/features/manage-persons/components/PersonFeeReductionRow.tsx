import { KkButton, KkChip, KkFactRow } from '@furria/ui';
import type { FC } from 'react';
import { currentSessionYear } from '@/lib/club';
import { toSessionPeriodChip } from '@/lib/state-chips';
import type { FactEditor } from '../hooks/use-fact-editor';
import {
  SESSION_SPAN_LABEL,
  toFeeReductionBasisLabel,
  toFeeReductionEditActionLabel,
  toFeeReductionSpan,
} from '../manage-persons-labels';
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

  const periodChip = toSessionPeriodChip(
    reduction.firstSessionYear,
    reduction.lastSessionYear,
    currentSessionYear(),
  );

  const chip =
    periodChip === null ? undefined : (
      <KkChip tone={periodChip.tone} dot={periodChip.dot} size="small">
        {periodChip.label}
      </KkChip>
    );

  const actions = (
    <KkButton
      size="small"
      variant="text"
      ariaLabel={toFeeReductionEditActionLabel(reduction)}
      onClick={startEdit}
    >
      {EDIT_LABEL}
    </KkButton>
  );

  return (
    <KkFactRow
      title={toFeeReductionBasisLabel(reduction.basis)}
      span={toFeeReductionSpan(reduction)}
      spanLabel={SESSION_SPAN_LABEL}
      chip={chip}
      actions={actions}
    />
  );
};

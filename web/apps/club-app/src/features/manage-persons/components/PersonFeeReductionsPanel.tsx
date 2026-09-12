import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import type { FactEditor } from '../hooks/use-fact-editor';
import { ADD_FEE_REDUCTION_ACTION_LABEL, PERSON_SECTION_TITLES } from '../manage-persons-labels';
import type { PersonDetails } from '../schemas';
import { FeeReductionEditor } from './FeeReductionEditor';
import { PersonFeeReductionRow } from './PersonFeeReductionRow';

const ADD_LABEL = 'Ermäßigung';
const EMPTY_TITLE = 'KEINE ERMÄSSIGUNG';
const EMPTY_DESCRIPTION =
  'Für diese Person ist keine Beitragsermäßigung hinterlegt. Über „+ Ermäßigung“ trägst du eine ein.';

interface PersonFeeReductionsPanelProps {
  person: PersonDetails;
  editor: FactEditor;
}

export const PersonFeeReductionsPanel: FC<PersonFeeReductionsPanelProps> = ({ person, editor }) => {
  const isAdding = editor.feeReduction !== null && editor.feeReduction.feeReductionId === null;

  const startAdd = (): void => {
    editor.openFeeReduction(null);
  };

  const action = (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="add" size="small" />}
      ariaLabel={ADD_FEE_REDUCTION_ACTION_LABEL}
      onClick={startAdd}
    >
      {ADD_LABEL}
    </KkButton>
  );

  const addEditor = isAdding ? (
    <FeeReductionEditor
      personId={person.personId}
      reduction={null}
      onClose={editor.close}
      onSaved={editor.close}
    />
  ) : null;

  const rows = person.feeReductions.map((reduction) => (
    <PersonFeeReductionRow
      key={reduction.feeReductionId}
      personId={person.personId}
      reduction={reduction}
      editor={editor}
    />
  ));

  const isEmpty = rows.length === 0 && !isAdding;

  const body = isEmpty ? (
    <KkEmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
  ) : (
    <>
      {addEditor}
      {rows}
    </>
  );

  return (
    <KkPanelSection title={PERSON_SECTION_TITLES.feeReductions} action={action}>
      <KkPanel variant={isEmpty ? 'block' : 'list'}>{body}</KkPanel>
    </KkPanelSection>
  );
};

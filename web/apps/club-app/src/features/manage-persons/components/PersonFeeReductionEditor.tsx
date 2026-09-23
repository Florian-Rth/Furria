import { KkFactRow, KkSelectField, KkSessionField, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import { usePersonFeeReductionEditor } from '../hooks/use-person-fee-reduction-editor';
import {
  FEE_REDUCTION_BASIS_OPTIONS,
  FEE_REDUCTION_CHAIN_TITLE,
  toFeeReductionChainRows,
  toPersonOrigin,
} from '../manage-persons-labels';
import type { PersonDetails, PersonFeeReduction } from '../schemas';

const BASIS_LABEL = 'Grundlage';
const BASIS_HINT = 'Wird manuell angegeben, nicht aus dem Geburtsdatum berechnet.';
const FIRST_LABEL = 'Von Session';
const LAST_LABEL = 'Bis Session';
const LAST_HINT = 'Eine Ermäßigung ist immer befristet und muss danach neu nachgewiesen werden.';

interface PersonFeeReductionEditorProps {
  person: PersonDetails;
  reduction: PersonFeeReduction | null;
}

export const PersonFeeReductionEditor: FC<PersonFeeReductionEditorProps> = ({
  person,
  reduction,
}) => {
  const control = usePersonFeeReductionEditor({ personId: person.personId, reduction });

  const chainRows = toFeeReductionChainRows(person, reduction?.feeReductionId ?? null);
  const chain =
    chainRows.length === 0 ? null : (
      <KkWriteScreen.Chain title={FEE_REDUCTION_CHAIN_TITLE}>
        {chainRows.map((row) => (
          <KkFactRow key={row.key} title={row.span} span="" highlight={row.isEdited} />
        ))}
      </KkWriteScreen.Chain>
    );

  return (
    <WriteScreen
      origin={toPersonOrigin(person)}
      title={control.actionLabel}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        context:
          control.consequence === null
            ? undefined
            : { text: control.consequence, tone: 'consequence' },
        primary: {
          label: control.actionLabel,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      {chain}
      <KkSelectField
        name="basis"
        label={BASIS_LABEL}
        value={control.basis}
        options={FEE_REDUCTION_BASIS_OPTIONS}
        onChange={control.selectBasis}
        required
        hint={BASIS_HINT}
      />
      <KkSessionField
        name="firstSessionYear"
        label={FIRST_LABEL}
        value={control.firstSessionYear}
        onChange={control.setFirstSessionYear}
        currentSessionYear={control.currentSessionYear}
        required
        error={control.firstSessionYearError !== undefined}
        helperText={control.firstSessionYearError}
      />
      <KkSessionField
        name="lastSessionYear"
        label={LAST_LABEL}
        value={control.lastSessionYear}
        onChange={control.setLastSessionYear}
        currentSessionYear={control.currentSessionYear}
        required
        error={control.lastSessionYearError !== undefined}
        helperText={control.lastSessionYearError}
        hint={LAST_HINT}
      />
    </WriteScreen>
  );
};

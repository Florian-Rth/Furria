import { KkFactRow } from '@furria/ui/KkFactRow';
import { KkFormPair } from '@furria/ui/KkFormPair';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkSessionField } from '@furria/ui/KkSessionField';
import { KkWriteScreen } from '@furria/ui/KkWriteScreen';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { WriteScreen } from '@/features/write/WriteScreen';
import { usePersonFeeReductionEditor } from '../hooks/use-person-fee-reduction-editor';
import {
  FEE_REDUCTION_BASIS_OPTIONS,
  FEE_REDUCTION_CHAIN_TITLE,
  toFeeReductionChainRows,
  toPersonOrigin,
} from '../manage-persons-labels';
import { FEE_REDUCTION_HELP_SPOTS } from '../person-fee-reduction-help-copy';
import type { PersonDetails, PersonFeeReduction } from '../schemas';
import { PersonFeeReductionHelp } from './PersonFeeReductionHelp';

const SECTION_TITLE = 'Ermäßigung';
const BASIS_LABEL = 'Grundlage';
const FIRST_LABEL = 'Von Session';
const LAST_LABEL = 'Bis Session';

interface PersonFeeReductionEditorProps {
  person: PersonDetails;
  reduction: PersonFeeReduction | null;
}

export const PersonFeeReductionEditor: FC<PersonFeeReductionEditorProps> = ({
  person,
  reduction,
}) => {
  const control = usePersonFeeReductionEditor({ personId: person.personId, reduction });

  const isEditing = reduction !== null;
  const help = toScreenHelp(<PersonFeeReductionHelp isEditing={isEditing} />);
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
      help={help}
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
      <KkFormSection title={SECTION_TITLE} landing={FEE_REDUCTION_HELP_SPOTS.basis}>
        <KkSelectField
          name="basis"
          label={BASIS_LABEL}
          value={control.basis}
          options={FEE_REDUCTION_BASIS_OPTIONS}
          onChange={control.selectBasis}
          presentation="choices"
          required
        />
        <KkFormPair
          start={
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
          }
          end={
            <KkSessionField
              name="lastSessionYear"
              label={LAST_LABEL}
              value={control.lastSessionYear}
              onChange={control.setLastSessionYear}
              currentSessionYear={control.currentSessionYear}
              required
              error={control.lastSessionYearError !== undefined}
              helperText={control.lastSessionYearError}
            />
          }
        />
      </KkFormSection>
    </WriteScreen>
  );
};

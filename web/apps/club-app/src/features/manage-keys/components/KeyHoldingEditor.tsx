import { KkDateField } from '@furria/ui/KkDateField';
import { KkFactRow } from '@furria/ui/KkFactRow';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkWriteScreen } from '@furria/ui/KkWriteScreen';
import type { FC } from 'react';
import { PersonPicker } from '@/features/group-hub/components/PersonPicker';
import { WriteScreen } from '@/features/write/WriteScreen';
import { useKeyHoldingEditor } from '../hooks/use-key-holding-editor';
import {
  toHandoutQuickChoices,
  toKeyEditorOrigin,
  toKeyHoldingChainRows,
  toReturnQuickChoices,
} from '../manage-keys-labels';
import type { KeyHolding, KeyVenue } from '../schemas';

const CHAIN_TITLE = 'Bisherige Schlüsselübergaben';
const PERSON_SECTION = 'Person';
const HANDOUT_SECTION = 'Übergabe';
const RETURN_SECTION = 'Rückgabe';
const SINCE_LABEL = 'Ausgegeben am';
const UNTIL_LABEL = 'Letzter Tag';

interface KeyHoldingEditorProps {
  venue: KeyVenue;
  holding: KeyHolding | null;
}

export const KeyHoldingEditor: FC<KeyHoldingEditorProps> = ({ venue, holding }) => {
  const control = useKeyHoldingEditor({ venueId: venue.venueId, venueName: venue.name, holding });
  const today = new Date();
  const handoutQuickChoices = toHandoutQuickChoices(today);
  const returnQuickChoices = toReturnQuickChoices(today);

  const chainRows = toKeyHoldingChainRows(venue, holding?.keyHoldingId ?? null);
  const chain =
    chainRows.length === 0 ? null : (
      <KkWriteScreen.Chain title={CHAIN_TITLE}>
        {chainRows.map((row) => (
          <KkFactRow key={row.key} title={row.title} span={row.span} highlight={row.isEdited} />
        ))}
      </KkWriteScreen.Chain>
    );

  const fields =
    holding === null ? (
      <>
        <KkFormSection title={PERSON_SECTION}>
          <PersonPicker
            selected={control.person}
            onSelect={control.select}
            onClear={control.clearPerson}
          />
        </KkFormSection>
        {chain}
        <KkFormSection title={HANDOUT_SECTION}>
          <KkDateField
            name="sinceOn"
            label={SINCE_LABEL}
            value={control.sinceOn}
            onChange={control.setSinceOn}
            quickChoices={handoutQuickChoices}
            required
            error={control.sinceOnError !== undefined}
            helperText={control.sinceOnError}
          />
        </KkFormSection>
      </>
    ) : (
      <>
        {chain}
        <KkFormSection title={RETURN_SECTION}>
          <KkDateField
            name="untilOn"
            label={UNTIL_LABEL}
            value={control.untilOn}
            onChange={control.setUntilOn}
            quickChoices={returnQuickChoices}
            required
            error={control.untilOnError !== undefined}
            helperText={control.untilOnError}
          />
        </KkFormSection>
      </>
    );

  return (
    <WriteScreen
      origin={toKeyEditorOrigin(venue.name)}
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
          tone: holding === null ? undefined : 'danger',
        },
      }}
    >
      {fields}
    </WriteScreen>
  );
};

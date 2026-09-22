import { KkDateField, KkFactRow, KkNote, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { PersonPicker } from '@/features/group-hub';
import { WriteScreen } from '@/features/write';
import { useKeyHoldingEditor } from '../hooks/use-key-holding-editor';
import {
  HANDOUT_EXPLANATION,
  HANDOUT_PICKER_NOTE,
  toHandoutQuickChoices,
  toKeyEditorOrigin,
  toKeyHoldingChainRows,
  toReturnQuickChoices,
} from '../manage-keys-labels';
import type { KeyHolding, KeyVenue } from '../schemas';

const CHAIN_TITLE = 'Bisherige Schlüsselübergaben';
const SINCE_LABEL = 'Ausgegeben am';
const SINCE_HINT = 'Darf in der Zukunft liegen. Vorher steht der Schlüssel nicht in der Übersicht.';
const UNTIL_LABEL = 'Letzter Tag';
const UNTIL_HINT = 'Dieser Tag zählt noch dazu.';

interface KeyHoldingEditorProps {
  venue: KeyVenue;
  holding: KeyHolding | null;
}

export const KeyHoldingEditor: FC<KeyHoldingEditorProps> = ({ venue, holding }) => {
  const control = useKeyHoldingEditor({ venueId: venue.venueId, venueName: venue.name, holding });
  const today = new Date();

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
        <KkNote>{HANDOUT_EXPLANATION}</KkNote>
        <PersonPicker
          selected={control.person}
          onSelect={control.select}
          onClear={control.clearPerson}
          note={HANDOUT_PICKER_NOTE}
        />
        {chain}
        <KkDateField
          name="sinceOn"
          label={SINCE_LABEL}
          value={control.sinceOn}
          onChange={control.setSinceOn}
          quickChoices={toHandoutQuickChoices(today)}
          hint={SINCE_HINT}
        />
      </>
    ) : (
      <>
        {chain}
        <KkDateField
          name="untilOn"
          label={UNTIL_LABEL}
          value={control.untilOn}
          onChange={control.setUntilOn}
          quickChoices={toReturnQuickChoices(today)}
          hint={UNTIL_HINT}
        />
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
          tone: holding === null ? undefined : 'danger',
        },
      }}
    >
      {fields}
    </WriteScreen>
  );
};

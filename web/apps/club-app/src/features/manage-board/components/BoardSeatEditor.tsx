import { KkDateField, KkFactRow, KkNote, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { PersonPicker } from '@/features/group-hub';
import { WriteScreen } from '@/features/write';
import { useBoardSeatEditor } from '../hooks/use-board-seat-editor';
import type { BoardOfficeEntry } from '../manage-board-labels';
import { toOfficeOrigin, toSeatChainRows } from '../manage-board-labels';
import type { BoardSeat } from '../schemas';

const CHAIN_TITLE = 'Bisherige Sitze';
const PICKER_NOTE = 'Kein Mitglied — geht trotzdem.';
const JOIN_EXPLANATION =
  'Such die Person im Verzeichnis. Wer noch nicht drin ist, muss zuerst in der Personenverwaltung angelegt werden.';
const SINCE_LABEL = 'Im Vorstand ab';
const SINCE_HINT = 'Der Tag der Wahl. Darf in der Zukunft liegen.';
const END_DATE_LABEL = 'Letzter Tag';
const END_DATE_HINT = 'Dieser Tag zählt noch dazu.';

interface BoardSeatEditorProps {
  entry: BoardOfficeEntry;
  seat: BoardSeat | null;
}

export const BoardSeatEditor: FC<BoardSeatEditorProps> = ({ entry, seat }) => {
  const control = useBoardSeatEditor({
    boardOfficeId: entry.boardOfficeId,
    officeName: entry.name,
    impliedRoleName: entry.impliedRoleName,
    seat,
  });

  const chainRows = toSeatChainRows(entry, seat?.boardSeatId ?? null);
  const chain =
    chainRows.length === 0 ? null : (
      <KkWriteScreen.Chain title={CHAIN_TITLE}>
        {chainRows.map((row) => (
          <KkFactRow key={row.key} title={row.span} span="" highlight={row.isEdited} />
        ))}
      </KkWriteScreen.Chain>
    );

  const fields =
    seat === null ? (
      <>
        <KkNote>{JOIN_EXPLANATION}</KkNote>
        <PersonPicker
          selected={control.person}
          onSelect={control.select}
          onClear={control.clearPerson}
          note={PICKER_NOTE}
        />
        {chain}
        <KkDateField
          name="sinceOn"
          label={SINCE_LABEL}
          value={control.sinceOn}
          onChange={control.setSinceOn}
          hint={SINCE_HINT}
        />
      </>
    ) : (
      <>
        {chain}
        <KkDateField
          name="endedOn"
          label={END_DATE_LABEL}
          value={control.endedOn}
          onChange={control.setEndedOn}
          hint={END_DATE_HINT}
        />
      </>
    );

  return (
    <WriteScreen
      origin={toOfficeOrigin(entry)}
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
          tone: seat === null ? undefined : 'danger',
        },
      }}
    >
      {fields}
    </WriteScreen>
  );
};

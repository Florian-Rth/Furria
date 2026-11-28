import { KkAnswerChoice } from '@furria/ui/KkAnswerChoice';
import { KkNamesSheet } from '@furria/ui/KkNamesSheet';
import type { FC, ReactNode } from 'react';
import { MARKED_ANSWERS } from '../calendar-marking';
import {
  MARKED_ANSWER_LABELS,
  MARKING_CLOSE_LABEL,
  MARKING_EMPTY,
  MARKING_LIST_LABEL,
  MARKING_TITLE,
} from '../calendar-marking-copy';
import type { CalendarMarkingControl, CalendarMarkingRow } from '../hooks/use-calendar-marking';
import { CalendarMarkingUndoButton } from './CalendarMarkingUndoButton';

interface CalendarMarkingSheetProps {
  marking: CalendarMarkingControl;
}

const undoActionOf = ({ undo }: CalendarMarkingRow): ReactNode =>
  undo === null ? undefined : <CalendarMarkingUndoButton undo={undo} />;

export const CalendarMarkingSheet: FC<CalendarMarkingSheetProps> = ({ marking }) => {
  const rows = marking.rows.map((row) => (
    <KkNamesSheet.ChoiceRow
      key={row.personId}
      name={row.name}
      note={row.note}
      trail={row.trail}
      action={undoActionOf(row)}
    >
      <KkAnswerChoice
        label={row.choiceLabel}
        value={row.value}
        onChange={row.choose}
        labels={MARKED_ANSWER_LABELS}
        answers={MARKED_ANSWERS}
      />
    </KkNamesSheet.ChoiceRow>
  ));
  const empty = rows.length === 0 ? <KkNamesSheet.Empty text={MARKING_EMPTY} /> : null;

  return (
    <KkNamesSheet
      open={marking.isOpen}
      label={MARKING_TITLE}
      closeLabel={MARKING_CLOSE_LABEL}
      onClose={marking.close}
    >
      <KkNamesSheet.Head>
        <KkNamesSheet.Title title={MARKING_TITLE} count={marking.count} />
      </KkNamesSheet.Head>
      <KkNamesSheet.List label={MARKING_LIST_LABEL}>
        {rows}
        {empty}
      </KkNamesSheet.List>
    </KkNamesSheet>
  );
};

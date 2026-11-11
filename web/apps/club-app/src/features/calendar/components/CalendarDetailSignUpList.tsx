import { KkSignUpSheet } from '@furria/ui/KkSignUpSheet';
import type { FC } from 'react';
import { useCalendarSignUpLineRemoval } from '../hooks/use-calendar-sign-up-line-removal';
import { useCalendarSignUpList } from '../hooks/use-calendar-sign-up-list';
import { useCalendarSignUpListClosing } from '../hooks/use-calendar-sign-up-list-closing';
import type { CalendarEntry, CalendarSignUpList } from '../schemas';
import { CalendarCloseAction } from './CalendarCloseAction';
import { CalendarNamesSheet } from './CalendarNamesSheet';
import { CalendarNotAnsweredRoll } from './CalendarNotAnsweredRoll';
import { CalendarReminderAction } from './CalendarReminderAction';
import { CalendarSignUpLineRemovalDialog } from './CalendarSignUpLineRemovalDialog';
import { CalendarSignUpOwnBox } from './CalendarSignUpOwnBox';

const LINES_HEADING = 'Eingetragen';
const CLOSE_LABEL = 'Liste schließen';

interface CalendarDetailSignUpListProps {
  list: CalendarSignUpList;
  entry: CalendarEntry;
  mayModerate: boolean;
}

export const CalendarDetailSignUpList: FC<CalendarDetailSignUpListProps> = ({
  list,
  entry,
  mayModerate,
}) => {
  const removal = useCalendarSignUpLineRemoval();
  const closing = useCalendarSignUpListClosing(list, mayModerate);
  const control = useCalendarSignUpList(list, mayModerate, entry, removal);
  const entryName = `sign-up-line-${list.signUpListId}`;
  const isRemovalOpen = removal.removal !== null;

  const lines = control.lines.map((line) => (
    <KkSignUpSheet.Line
      key={line.lineId}
      name={line.name}
      text={line.text}
      removeLabel={line.removeLabel}
      removeDisabled={control.isBusy}
      onRemove={line.askRemoval}
    />
  ));
  const linesList =
    lines.length === 0 ? null : (
      <KkSignUpSheet.Lines heading={LINES_HEADING} busy={control.isBusy}>
        {lines}
      </KkSignUpSheet.Lines>
    );
  const allLines =
    control.allLinesLabel === undefined ? null : (
      <KkSignUpSheet.More label={control.allLinesLabel} onClick={control.openAllLines} />
    );
  const closeAction = closing.canClose ? (
    <CalendarCloseAction
      label={CLOSE_LABEL}
      copy={closing.copy}
      isClosing={closing.isClosing}
      onClose={closing.close}
    />
  ) : null;

  return (
    <KkSignUpSheet label={control.title}>
      <KkSignUpSheet.Head title={control.title} count={control.count} note={control.note} />
      <CalendarSignUpOwnBox control={control} fieldName={entryName} />
      {linesList}
      {allLines}
      <CalendarNotAnsweredRoll
        label={control.title}
        openTab={control.openTab}
        onOpen={control.sheet.open}
      />
      <CalendarNamesSheet
        title={control.title}
        count={control.sheetCount}
        tabs={control.tabs}
        sheet={control.sheet}
        openAction={<CalendarReminderAction source={control.reminder} />}
      />
      {closeAction}
      <CalendarSignUpLineRemovalDialog
        open={isRemovalOpen}
        question={removal.question}
        onConfirm={removal.confirm}
        onCancel={removal.cancel}
      />
    </KkSignUpSheet>
  );
};

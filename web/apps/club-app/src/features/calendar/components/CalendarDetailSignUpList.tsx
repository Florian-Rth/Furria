import { KkSignUpSheet } from '@furria/ui/KkSignUpSheet';
import type { FC } from 'react';
import { SIGN_UP_LINE_TEXT_MAX_LENGTH } from '../calendar-sign-up-lists';
import { useCalendarSignUpLineRemoval } from '../hooks/use-calendar-sign-up-line-removal';
import { useCalendarSignUpList } from '../hooks/use-calendar-sign-up-list';
import { useCalendarSignUpListClosing } from '../hooks/use-calendar-sign-up-list-closing';
import type { CalendarEntry, CalendarSignUpList } from '../schemas';
import { CalendarCloseAction } from './CalendarCloseAction';
import { CalendarNotAnsweredRoll } from './CalendarNotAnsweredRoll';
import { CalendarReminderAction } from './CalendarReminderAction';
import { CalendarSignUpLineRemovalDialog } from './CalendarSignUpLineRemovalDialog';

const LINES_LABEL = 'Einträge';
const OWN_LINE_LABEL = 'Dein Eintrag';
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
      own={line.isOwn}
      ownLabel={OWN_LINE_LABEL}
      removeLabel={line.removeLabel}
      removeDisabled={control.isBusy}
      onRemove={line.askRemoval}
    />
  ));
  const linesList =
    lines.length === 0 ? null : (
      <KkSignUpSheet.Lines label={LINES_LABEL} busy={control.isBusy}>
        {lines}
      </KkSignUpSheet.Lines>
    );
  const ownLineField = control.takesLines ? (
    <KkSignUpSheet.Entry
      name={entryName}
      label={OWN_LINE_LABEL}
      value={control.draft}
      maxLength={SIGN_UP_LINE_TEXT_MAX_LENGTH}
      saveLabel={control.saveLabel}
      canSave={control.canSave}
      saving={control.isBusy}
      removeLabel={control.deleteOwnLabel}
      onChange={control.setDraft}
      onSave={control.save}
      onRemove={control.deleteOwnLine}
    />
  ) : null;
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
      <KkSignUpSheet.Head title={control.title} hint={control.hint} meta={control.meta} />
      {linesList}
      <CalendarNotAnsweredRoll label={control.title} notAnswered={list.notAnswered} />
      <CalendarReminderAction source={control.reminder} />
      {ownLineField}
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

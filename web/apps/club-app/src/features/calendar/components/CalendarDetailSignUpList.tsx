import { KkSignUpSheet } from '@furria/ui/KkSignUpSheet';
import type { FC } from 'react';
import { SIGN_UP_LINE_TEXT_MAX_LENGTH } from '../calendar-sign-up-lists';
import { useCalendarSignUpLineRemoval } from '../hooks/use-calendar-sign-up-line-removal';
import { useCalendarSignUpList } from '../hooks/use-calendar-sign-up-list';
import { useCalendarSignUpListClosing } from '../hooks/use-calendar-sign-up-list-closing';
import type { CalendarSignUpList } from '../schemas';
import { CalendarCloseAction } from './CalendarCloseAction';
import type { CalendarConfirmCopy } from './CalendarConfirmDialog';
import { CalendarNotAnsweredRoll } from './CalendarNotAnsweredRoll';
import { CalendarSignUpLineRemovalDialog } from './CalendarSignUpLineRemovalDialog';

const LINES_LABEL = 'Einträge';
const ENTRY_LABEL = 'Dein Eintrag';
const OWN_LINE_LABEL = 'Dein Eintrag';
const CLOSE_LABEL = 'Liste schließen';
const CLOSE_COPY: Omit<CalendarConfirmCopy, 'question'> = {
  eyebrow: 'LISTE SCHLIESSEN',
  explanation: 'Danach kann sich niemand mehr eintragen oder austragen.',
  confirmLabel: 'Schließen',
  cancelLabel: 'Offen lassen',
  closeLabel: 'Abbrechen',
};

interface CalendarDetailSignUpListProps {
  list: CalendarSignUpList;
  mayModerate: boolean;
  mayAnswer: boolean;
}

export const CalendarDetailSignUpList: FC<CalendarDetailSignUpListProps> = ({
  list,
  mayModerate,
  mayAnswer,
}) => {
  const removal = useCalendarSignUpLineRemoval();
  const closing = useCalendarSignUpListClosing(list, mayModerate);
  const control = useCalendarSignUpList(list, mayModerate, removal);
  const entryName = `sign-up-line-${list.signUpListId}`;
  const isRemovalOpen = removal.removal !== null;
  const closeCopy: CalendarConfirmCopy = { ...CLOSE_COPY, question: closing.question };

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
  const takesLines = control.isOpen && mayAnswer;
  const notAnswered =
    list.notAnswered === null ? null : <CalendarNotAnsweredRoll notAnswered={list.notAnswered} />;
  const entry = takesLines ? (
    <KkSignUpSheet.Entry
      name={entryName}
      label={ENTRY_LABEL}
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
      copy={closeCopy}
      isClosing={closing.isClosing}
      onClose={closing.close}
    />
  ) : null;

  return (
    <KkSignUpSheet label={control.title}>
      <KkSignUpSheet.Head title={control.title} hint={control.hint} meta={control.meta} />
      {linesList}
      {notAnswered}
      {entry}
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

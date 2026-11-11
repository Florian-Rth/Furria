import { KkSignUpSheet } from '@furria/ui/KkSignUpSheet';
import type { FC } from 'react';
import { SIGN_UP_LINE_TEXT_MAX_LENGTH } from '@/features/calendar/calendar-sign-up-lists';
import { useOwedSignUp } from '../hooks/use-owed-sign-up';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartEntry, StartSignUpList } from '../schemas';

const OWN_LABEL = 'Du';
const FIELD_LABEL = 'Dein Eintrag';
const SIGN_UP_LABEL = 'Eintragen';

interface OwedSignUpProps {
  entry: StartEntry;
  list: StartSignUpList;
  board: StartBoard;
}

export const OwedSignUp: FC<OwedSignUpProps> = ({ entry, list, board }) => {
  const signUp = useOwedSignUp(entry, list, board);
  const fieldName = `start-sign-up-${list.signUpListId}`;

  const own = signUp.isSigned ? (
    <KkSignUpSheet.OwnLine text={signUp.ownText} />
  ) : (
    <KkSignUpSheet.Entry
      name={fieldName}
      label={FIELD_LABEL}
      value={signUp.draft}
      maxLength={SIGN_UP_LINE_TEXT_MAX_LENGTH}
      saveLabel={SIGN_UP_LABEL}
      canSave={signUp.canSave}
      saving={signUp.isBusy}
      onChange={signUp.setDraft}
      onSave={signUp.save}
    />
  );

  return (
    <KkSignUpSheet label={signUp.title}>
      <KkSignUpSheet.Head title={signUp.title} note={signUp.hint} heading="h3" />
      <KkSignUpSheet.Own label={OWN_LABEL}>{own}</KkSignUpSheet.Own>
    </KkSignUpSheet>
  );
};

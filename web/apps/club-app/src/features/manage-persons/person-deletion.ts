import type { KkConfirmFact } from '@furria/ui';
import { toMembershipStateLabel } from '@/lib/membership-labels';
import { toPersonName } from './manage-persons-labels';
import type { RunningTie } from './person-archive';
import { toRunningTiesList } from './person-archive';
import type { PersonDetails } from './schemas';

type AccountState = PersonDetails['access']['state'];

export type ErasureNotice = 'signsOutSelf' | 'mailsHolder' | 'tellsNobody';

const ACCOUNT_STATES: readonly AccountState[] = ['active', 'disabled'];

export const toErasureNotice = (isSelf: boolean, accountState: AccountState): ErasureNotice => {
  if (isSelf) {
    return 'signsOutSelf';
  }

  return ACCOUNT_STATES.includes(accountState) ? 'mailsHolder' : 'tellsNobody';
};

export const DELETE_PERSON_LABEL = 'Person löschen';
export const DELETE_CONFIRM_LABEL = 'Endgültig löschen';
export const DELETE_EYEBROW = 'Person löschen';

const WHAT_GOES =
  'Gelöscht wird alles, was der Verein über die Person festgehalten hat – Mitgliedschaften, Gruppen, Rollen, Ämter, Schlüssel, Zusagen und ihr Account. Wo sie im Verein etwas getan hat, etwa einen Aushang oder eine Aufnahme, nennt das danach niemanden mehr.';
const PROOF_BY_PASSWORD = 'Bestätige mit deinem Passwort.';
const PROOF_BY_EITHER = 'Bestätige mit deinem Passwort oder deinem Passkey.';

export const toDeletionExplanation = (offersPasskey: boolean): string =>
  `${WHAT_GOES} ${offersPasskey ? PROOF_BY_EITHER : PROOF_BY_PASSWORD}`;

const SELF_QUESTION = 'Dich selbst endgültig löschen?';

export const toDeletionQuestion = (person: PersonDetails, isSelf: boolean): string =>
  isSelf ? SELF_QUESTION : `${toPersonName(person)} endgültig löschen?`;

export const toDeletionFacts = (person: PersonDetails): KkConfirmFact[] => [
  { label: 'Person', value: toPersonName(person) },
  { label: 'Mitgliedschaft', value: toMembershipStateLabel(person.membershipState) },
];

const ERASED_FOR_GOOD = 'Alles wird endgültig gelöscht.';

const toNoticeSentence = (notice: ErasureNotice, firstName: string): string => {
  switch (notice) {
    case 'signsOutSelf':
      return 'Du wirst danach abgemeldet und bekommst eine Bestätigung per E-Mail.';
    case 'mailsHolder':
      return `${firstName} wird abgemeldet und per E-Mail über die Löschung informiert.`;
    case 'tellsNobody':
      return `${firstName} hat keinen Account und wird nicht benachrichtigt.`;
  }
};

export const toDeletionConsequence = (
  ties: readonly RunningTie[],
  notice: ErasureNotice,
  firstName: string,
): string => {
  const running = ties.length > 0 ? `Läuft noch: ${toRunningTiesList(ties)}. ` : '';

  return `${running}${ERASED_FOR_GOOD} ${toNoticeSentence(notice, firstName)}`;
};

export const toPersonErasedMessage = (personName: string): string => `${personName} ist gelöscht.`;

export const toPersonAlreadyErasedMessage = (personName: string): string =>
  `${personName} war schon gelöscht.`;

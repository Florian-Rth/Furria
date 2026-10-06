import type { ConfirmationFailure, ConfirmationVerdict } from './confirmation-stage';
import { joinApplyHref } from './join-content';

export type ConfirmationNextStep = 'onward' | 'reapply';

export interface ConfirmationVerdictView {
  eyebrow: string;
  headline: string;
  text: string;
  next: ConfirmationNextStep;
}

export const confirmPath = '/join/confirm';

export const confirmPendingEyebrow = 'EINEN MOMENT';

export const confirmPendingHeadline = 'WIR BESTÄTIGEN DEINEN ANTRAG …';

export const CONFIRMATION_VERDICT_VIEWS: Record<ConfirmationVerdict, ConfirmationVerdictView> = {
  confirmed: {
    eyebrow: 'ANTRAG BESTÄTIGT',
    headline: 'JETZT IST ER BEI UNS.',
    text: 'Danke! Dein Antrag ist beim Verein angekommen. Wir sehen ihn uns in der nächsten Sitzung an, entscheiden über die Aufnahme und melden uns bei dir, so oder so. Bis dahin musst du nichts tun und nichts zahlen.',
    next: 'onward',
  },
  alreadyConfirmed: {
    eyebrow: 'SCHON BESTÄTIGT',
    headline: 'DEN HABEN WIR SCHON.',
    text: 'Diesen Antrag hast du bereits bestätigt — er liegt beim Verein, ein zweiter Klick ändert daran nichts. Wir melden uns bei dir, sobald wir über die Aufnahme entschieden haben.',
    next: 'onward',
  },
  expired: {
    eyebrow: 'LINK UNGÜLTIG',
    headline: 'DIESER LINK GILT NICHT MEHR.',
    text: 'Ein Bestätigungslink gilt 48 Stunden. Danach löschen wir den unbestätigten Antrag wieder — stell ihn einfach noch einmal, es dauert zwei Minuten. Und falls du ihn längst bestätigt hast und wir schon entschieden haben: Dann hörst du ohnehin von uns.',
    next: 'reapply',
  },
  incomplete: {
    eyebrow: 'LINK UNVOLLSTÄNDIG',
    headline: 'DA FEHLT EIN STÜCK.',
    text: 'Diesem Link fehlt der Teil, an dem wir deinen Antrag erkennen. Öffne ihn direkt aus der Mail — oder kopier ihn vollständig in die Adresszeile.',
    next: 'reapply',
  },
};

export const confirmFailedEyebrow = 'NICHT BESTÄTIGT';

export const confirmFailedHeadline = 'DAS HAT GERADE NICHT GEKLAPPT.';

export const CONFIRMATION_FAILURE_TEXTS: Record<ConfirmationFailure, string> = {
  blocked:
    'Die Anfrage hat den Server nicht erreicht. Falls du einen Werbeblocker oder ein Schutz-Add-on nutzt, erlaube diese Seite und versuch es noch einmal.',
  unavailable:
    'Wir konnten deinen Antrag gerade nicht bestätigen. Das liegt an uns, nicht an dir — der Link gilt weiter, versuch es gleich noch einmal.',
};

export const confirmRetryLabel = 'Nochmal versuchen';

export const confirmMailLabel = 'Schreib uns';

export const confirmReapplyLabel = 'Antrag neu stellen →';

export const confirmReapplyHref = joinApplyHref;

export const confirmEventsLabel = 'Veranstaltungen ansehen';

export const confirmEventsHref = '/events';

export const confirmHomeLabel = 'Zur Startseite';

export const confirmHomeHref = '/';

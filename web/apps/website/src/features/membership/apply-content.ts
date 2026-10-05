import type { LinkProps } from '@tanstack/react-router';
import { joinHref } from './join-content';
import type { DerivedMembership, MembershipTypeId } from './membership-derivation';
import type { JoinStep } from './steps-content';

export interface ApplySummaryRow {
  label: string;
  value: string;
}

export const buildApplyEyebrow = (sessionLabel: string | undefined): string =>
  sessionLabel === undefined ? 'BEITRITTSANTRAG' : `BEITRITTSANTRAG · SESSION ${sessionLabel}`;

export const applyTitle = 'EIN FORMULAR, ZWEI MINUTEN.';

export const applyLead =
  'Kein Kauf, kein Abo, keine Unterschrift per Post: Du stellst einen Antrag und bestätigst ihn per Mail. Wir sehen ihn uns in der nächsten Sitzung an und melden uns bei dir.';

export const applyBackLabel = '← Mitglied werden';

export const applyBackHref: LinkProps['to'] = joinHref;

export const applyFieldLabels = {
  firstName: 'Vorname',
  lastName: 'Nachname',
  birthDate: 'Geburtsdatum',
  street: 'Straße und Hausnummer',
  postalCode: 'PLZ',
  city: 'Ort',
  email: 'E-Mail',
  phone: 'Telefon',
} as const;

export const applyPersonLegend = '01 · WER BIST DU';

export const applyAddressLegend = '02 · WO WOHNST DU';

export const applyAddressNote =
  'Die Anschrift steht in unseren Mitgliederunterlagen, deshalb fragen wir sie vollständig — nicht, weil der Wohnort eine Rolle spielt. Er spielt keine.';

export const applyContactLegend = '03 · WIE ERREICHEN WIR DICH';

export const applyContactNote =
  'An diese Adresse schicken wir dir gleich den Link, mit dem du den Antrag bestätigst. Die Telefonnummer ist freiwillig — sie hilft nur, wenn eine Mail liegen bleibt.';

export const applyConsentLegend = '04 · EINVERSTÄNDNIS';

export const applyConsentLead = 'Ich habe die';

export const applyConsentTail = 'gelesen und stimme dem Beitritt zu.';

export const applyConsentConjunction = 'und die';

export const applySatzungLabel = 'Satzung';

export const applySatzungHref = '/satzung';

export const applyPrivacyLabel = 'Datenschutzhinweise';

export const applyPrivacyHref = '/privacy';

export const applyConsentNote =
  'Jetzt wird nichts abgebucht. Der Beitrag wird erst fällig, wenn wir dich aufgenommen haben.';

export const applyHoneypotLabel = 'Dieses Feld bitte leer lassen';

export const applySummaryEyebrow = 'DEIN ANTRAG';

export const applySummaryNote =
  'Die Mitgliedschaft ergibt sich aus dem Geburtsdatum: bis 17 Jahre Jugend, ab 18 Aktiv. Aussuchen musst du da nichts.';

export const applyMinorNote =
  'Weil du noch nicht 18 bist, brauchen wir vor der Aufnahme das Einverständnis deiner Eltern. Darum kümmern wir uns, wenn wir uns bei dir melden — im Formular musst du dafür nichts eintragen.';

export const applyTooYoungMailLabel = 'Jünger? Schreib uns';

export const buildBelowAgeOfConsentMessage = (ageOfConsent: number): string =>
  `Online beantragen kann den Beitritt, wer mindestens ${ageOfConsent} Jahre alt ist. Bist du jünger, schreib uns – dann nehmen wir dich direkt auf.`;

export const applySubmitLabel = 'Antrag absenden →';

export const applySubmitDisabledHint =
  'Der Knopf wird aktiv, sobald alle Pflichtfelder ausgefüllt sind.';

export const applySubmitNote =
  'Danach bekommst du eine Mail: Erst wenn du den Antrag dort bestätigst, geht er an den Verein. Mitglied bist du, sobald wir dich aufgenommen haben.';

export const applyErrorTitle = 'Der Antrag ist nicht rausgegangen.';

export const applyFallbackLead =
  'Das liegt an uns, nicht an dir. Schick ihn uns direkt per Mail — die Daten sind darin schon eingetragen, und im Formular bleibt alles stehen.';

export const applyFallbackLabel = 'Antrag per Mail schicken';

export const applyBlockedMessage =
  'Die Anfrage hat den Server nicht erreicht. Falls du einen Werbeblocker oder ein Schutz-Add-on nutzt, erlaube diese Seite und versuch es noch einmal.';

export const applyUnavailableMessage = 'Wir konnten den Antrag gerade nicht entgegennehmen.';

export const applyRateLimitedMessage =
  'Von hier kamen gerade sehr viele Anträge auf einmal. Warte eine Viertelstunde und schick ihn dann noch einmal ab — im Formular bleibt alles stehen.';

export const applyProofRefusedMessage =
  'Die automatische Sicherheitsprüfung ist abgelaufen. Schick den Antrag einfach noch einmal ab — im Formular bleibt alles stehen.';

export const applyThanksEyebrow = 'FAST GESCHAFFT';

export const buildApplyThanksHeadline = (firstName: string): string =>
  `NOCH EIN KLICK, ${firstName}.`;

export const buildApplyThanksText = (email: string): string =>
  `Wir haben dir eine Mail an ${email} geschickt. Klick darin auf „Antrag bestätigen“ — erst dann kommt dein Antrag beim Verein an. Der Link gilt 48 Stunden; bestätigst du ihn nicht, löschen wir den Antrag wieder.`;

export const APPLY_THANKS_STEPS: JoinStep[] = [
  {
    title: 'Bestätigen',
    description:
      'Öffne die Mail und bestätige den Antrag. Kommt nichts an, schau kurz in den Spam-Ordner. Steht oben eine falsche Adresse, stell den Antrag einfach noch einmal.',
  },
  {
    title: 'Aufnahme',
    description:
      'Danach sehen wir uns den Antrag in der nächsten Sitzung an und entscheiden über die Aufnahme. Wir melden uns bei dir, so oder so.',
  },
  {
    title: 'Willkommen',
    description:
      'Sagen wir ja, sagen wir dir gleich mit, wann und wo dein erstes Training ist — und du bekommst deinen Zugang zur Club-App.',
  },
];

export const applyThanksEventsLabel = 'Veranstaltungen ansehen';

export const applyThanksEventsHref = '/events';

export const applyThanksHomeLabel = 'Zur Startseite';

export const applyThanksHomeHref = '/';

export const MEMBERSHIP_TYPE_LABELS: Record<MembershipTypeId, string> = {
  active: 'Aktiv',
  youth: 'Jugend',
};

const PENDING_DERIVATION = 'steht mit dem Geburtsdatum';

export const applyNothingDueValue = '0 €';

export const buildApplySummaryRows = (derived: DerivedMembership | null): ApplySummaryRow[] => [
  {
    label: 'MITGLIEDSCHAFT',
    value: derived === null ? PENDING_DERIVATION : MEMBERSHIP_TYPE_LABELS[derived.typeId],
  },
  {
    label: 'BEITRAG',
    value: derived === null ? PENDING_DERIVATION : `${derived.feeEuros} € im Jahr`,
  },
  { label: 'JETZT FÄLLIG', value: applyNothingDueValue },
];

import type { LinkProps } from '@tanstack/react-router';
import { currentSession } from '@/lib/club';
import { joinHref } from './join-content';
import type { DerivedMembership, MembershipTypeId } from './membership-derivation';
import type { JoinStep } from './steps-content';

export interface ApplySummaryRow {
  label: string;
  value: string;
}

export const buildApplyEyebrow = (yearsLabel: string): string =>
  `BEITRITTSANTRAG · SESSION ${yearsLabel}`;

export const applyEyebrow: string = buildApplyEyebrow(currentSession.yearsLabel);

export const applyTitle = 'EIN FORMULAR, ZWEI MINUTEN.';

export const applyLead =
  'Kein Kauf, kein Abo, keine Unterschrift per Post: Du stellst einen Antrag. Wir sehen ihn uns in der nächsten Sitzung an und melden uns bei dir.';

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
  guardianName: 'Name der gesetzlichen Vertretung',
  guardianEmail: 'E-Mail der gesetzlichen Vertretung',
  guardianPhone: 'Telefon der gesetzlichen Vertretung',
} as const;

export const applyPersonLegend = '01 · WER BIST DU';

export const applyAddressLegend = '02 · WO WOHNST DU';

export const applyAddressNote =
  'Die Anschrift steht in unseren Mitgliederunterlagen, deshalb fragen wir sie vollständig — nicht, weil der Wohnort eine Rolle spielt. Er spielt keine.';

export const applyContactLegend = '03 · WIE ERREICHEN WIR DICH';

export const applyContactNote =
  'Die Telefonnummer ist freiwillig. Sie hilft nur, wenn eine Mail liegen bleibt.';

export const applyInterestsLegend = '04 · WOHIN ZIEHT ES DICH';

export const applyInterestsNote =
  'Freiwillig, und ein Kreuz ist keine Zusage — bevor etwas losgeht, reden wir darüber. In keiner Gruppe zu sein ist genauso normal: viele Mitglieder sind in keiner.';

export const applyInterestsLoadingLabel = 'Die Gruppen werden geladen …';

export const applyInterestsErrorNote =
  'Die Liste der Gruppen lädt gerade nicht. Kein Problem — das Feld ist freiwillig, du kannst es uns auch später sagen.';

export const applyGuardianLegend = 'WEIL DU NOCH NICHT 18 BIST';

export const applyGuardianNote =
  'Unter 18 stimmt eine erwachsene Person mit zu — Mutter, Vater oder Vormund. Anders geht ein Beitritt rechtlich nicht. E-Mail oder Telefon genügt, damit wir uns melden können.';

export const applyConsentLegend = '05 · EINVERSTÄNDNIS';

export const applyConsentLeadSelf = 'Ich habe die';

export const applyConsentLeadGuardian = 'Als gesetzliche Vertretung habe ich die';

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

export const applySubmitLabel = 'Antrag absenden →';

export const applySubmitDisabledHint =
  'Der Knopf wird aktiv, sobald alle Pflichtfelder ausgefüllt sind.';

export const applySubmitNote =
  'Der Antrag geht an den Verein. Mitglied bist du, sobald wir dir das bestätigen.';

export const applyErrorTitle = 'Der Antrag ist nicht rausgegangen.';

export const applyFallbackLead =
  'Das liegt an uns, nicht an dir. Schick ihn uns direkt per Mail — die Daten sind darin schon eingetragen, und im Formular bleibt alles stehen.';

export const applyFallbackLabel = 'Antrag per Mail schicken';

export const applyThanksEyebrow = 'ANTRAG IST DA';

export const buildApplyThanksHeadline = (firstName: string): string => `DANKE, ${firstName}.`;

export const applyThanksText =
  'Angekommen. Ab hier sind wir dran — du musst nichts tun und nichts zahlen. Bis wir über die Aufnahme entschieden haben, bist du noch kein Mitglied, sondern jemand, auf den wir uns freuen.';

export const APPLY_THANKS_STEPS: JoinStep[] = [
  {
    title: 'Bestätigung',
    description:
      'Zuerst bestätigen wir dir per Mail, dass der Antrag bei uns angekommen ist — an die Adresse, die du eingetragen hast. Falls nichts ankommt, schau kurz in den Spam-Ordner.',
  },
  {
    title: 'Aufnahme',
    description:
      'Danach sehen wir uns den Antrag in der nächsten Sitzung an und entscheiden über die Aufnahme. Wir melden uns danach bei dir, so oder so.',
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

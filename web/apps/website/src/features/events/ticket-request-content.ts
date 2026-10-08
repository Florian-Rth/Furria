export const ticketRequestCtaLabel = 'Karten anfragen →';

export const ticketRequestEyebrowPrefix = 'KARTENANFRAGE';

export const ticketRequestLead =
  'Online verkaufen wir die Karten für diesen Abend nicht. Sag uns, wie viele du möchtest — wir melden uns bei dir und klären den Rest persönlich.';

export const buildTicketRequestBackLabel = (eventTitle: string): string => `← ${eventTitle}`;

export const ticketRequestFieldLabels = {
  ticketCount: 'Anzahl Karten',
  name: 'Vor- und Nachname',
  phone: 'Telefon',
  email: 'E-Mail',
  message: 'Nachricht (freiwillig)',
} as const;

export const ticketRequestCountLegend = '01 · WIE VIELE KARTEN';

export const ticketRequestCountNote =
  'Brauchst du mehr als zehn Karten, etwa für einen Verein oder eine Firma, schreib es uns in die Nachricht.';

export const ticketRequestPersonLegend = '02 · WER FRAGT AN';

export const ticketRequestContactLegend = '03 · WIE ERREICHEN WIR DICH';

export const ticketRequestContactNote =
  'Wir melden uns per Telefon oder Mail, je nachdem, was schneller geht. Für nichts anderes nutzen wir die Angaben.';

export const ticketRequestMessageLegend = '04 · NOCH ETWAS?';

export const ticketRequestConsentLegend = '05 · EINVERSTÄNDNIS';

export const ticketRequestConsentLead = 'Ich habe die';

export const ticketRequestPrivacyLabel = 'Datenschutzhinweise';

export const ticketRequestPrivacyHref = '/privacy';

export const ticketRequestConsentTail =
  'gelesen und bin einverstanden, dass der Verein meine Angaben für diese Anfrage nutzt.';

export const ticketRequestConsentNote =
  'Wir löschen die Anfrage, sobald sie erledigt ist — spätestens am Tag nach der Veranstaltung.';

export const ticketRequestSummaryEyebrow = 'DEINE ANFRAGE';

export const ticketRequestSummaryNote =
  'Die Anfrage ist noch keine Bestellung und kostet nichts. Wie du an die Karten kommst, besprechen wir mit dir.';

export const ticketRequestSubmitLabel = 'Anfrage absenden →';

export const ticketRequestSubmitDisabledHint =
  'Der Knopf wird aktiv, sobald alle Pflichtfelder ausgefüllt sind.';

export const ticketRequestSubmitNote =
  'Du bekommst gleich eine Mail, dass die Anfrage beim Verein ist. Die Antwort kommt von uns persönlich.';

export const ticketRequestErrorTitle = 'Die Anfrage ist nicht rausgegangen.';

export const ticketRequestFallbackLead =
  'Das liegt an uns, nicht an dir. Schick sie uns direkt per Mail — die Angaben sind darin schon eingetragen, und im Formular bleibt alles stehen.';

export const ticketRequestFallbackLabel = 'Anfrage per Mail schicken';

export const ticketRequestBlockedMessage =
  'Die Anfrage hat den Server nicht erreicht. Falls du einen Werbeblocker oder ein Schutz-Add-on nutzt, erlaube diese Seite und versuch es noch einmal.';

export const ticketRequestUnavailableMessage =
  'Wir konnten die Anfrage gerade nicht entgegennehmen.';

export const ticketRequestRateLimitedMessage =
  'Von hier kamen gerade sehr viele Anfragen auf einmal. Warte eine Viertelstunde und schick sie dann noch einmal ab — im Formular bleibt alles stehen.';

export const ticketRequestProofRefusedMessage =
  'Die automatische Sicherheitsprüfung ist abgelaufen. Schick die Anfrage einfach noch einmal ab — im Formular bleibt alles stehen.';

export const ticketRequestClosedMessage =
  'Für diesen Abend nehmen wir inzwischen keine Kartenanfragen mehr an.';

export const ticketRequestGoneMessage = 'Diese Veranstaltung gibt es nicht mehr.';

export const ticketRequestClosedEyebrow = 'KEINE ANFRAGEN';

export const ticketRequestClosedTitle = 'GERADE GEHT HIER NICHTS.';

export const ticketRequestClosedLead =
  'Für diesen Abend nehmen wir gerade keine Kartenanfragen an. Was los ist, steht auf der Seite der Veranstaltung.';

export const ticketRequestThanksEyebrow = 'ANFRAGE IST DA';

export const ticketRequestThanksTitle = 'DANKE, WIR MELDEN UNS.';

export const ticketRequestEventLabel = 'Zur Veranstaltung';

export const ticketRequestAllEventsLabel = 'Alle Veranstaltungen';

export const ticketRequestAllEventsHref = '/events';

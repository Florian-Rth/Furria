import { currentSession } from '@/lib/club';
import { joinApplyHref } from './join-content';

export interface MembershipTicketRow {
  label: string;
  value: string;
}

export const membershipTicketSectionId = 'die-mitgliedschaft';

export const membershipTicketKicker = 'DIE MITGLIEDSCHAFT';

export const membershipTicketTitle = 'ALLES AUF EINER KARTE.';

export const membershipTicketIntro =
  'Diese Karte ist kein Kauf und keine Karte für einen Abend. Sie ist die Übersicht: was die Mitgliedschaft kostet, was sie dir bringt, was wir von dir erwarten — und was du jederzeit fragen darfst.';

export const buildMembershipTicketStamp = (yearsLabel: string): string =>
  `MITGLIEDSCHAFT · SESSION ${yearsLabel}`;

export const membershipTicketStamp: string = buildMembershipTicketStamp(currentSession.yearsLabel);

export const membershipTicketNumberLabel = 'MITGLIED NR.';

export const membershipTicketHeadline = 'DEIN PLATZ IM VEREIN';

export const membershipTicketLead =
  'Eine Karte, alles drauf. Danach weißt du, worauf du dich einlässt — und vor allem, was niemand von dir verlangt.';

export const membershipTicketRows: MembershipTicketRow[] = [
  { label: 'BEITRAG', value: '30 € im Jahr · bis 17 Jahre 15 € · keine Aufnahmegebühr' },
  { label: 'LAUFZEIT', value: 'Pro Session. Kündigung zum Ende der Session.' },
  {
    label: 'PAUSE',
    value: 'Eine Session aussetzen geht: die Mitgliedschaft ruht, statt zu enden.',
  },
  { label: 'GRUPPEN', value: 'Eine, mehrere oder keine. Alles davon ist normal.' },
  { label: 'DRIN', value: 'Training in deiner Gruppe · Auftritte · Ordensfest & Orden · Club-App' },
  {
    label: 'ERWARTET',
    value: 'In Auftrittsgruppen regelmäßige Proben in der Session · beim Aufbau mit anfassen',
  },
  { label: 'FRAGEN', value: 'Jederzeit — auch ohne Antrag.' },
];

export const membershipTicketObjections: string[] = [
  'Keine Aufnahmegebühr',
  'Kein Vorsingen',
  'Wohnort egal',
];

export const membershipTicketStubMark = 'FURRIA';

export const membershipTicketStubLabel = 'Antrag stellen';

export const membershipTicketStubHref = joinApplyHref;

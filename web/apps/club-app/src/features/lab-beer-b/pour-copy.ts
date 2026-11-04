import type { LabBeerRefusal } from '@/features/lab-beer/beer-lab-actions';
import type { LabBeerCorrectionReason, LabBeerPerson } from '@/features/lab-beer/beer-lab-types';
import type { PourDayName } from './pour-time';
import { weekdayDateOf } from './pour-time';
import type { PourViewer } from './schemas';

export const POUR_TITLE = 'Bierliste';
export const POUR_HUB_TITLE = 'Bierliste verwalten';
export const CLOSE_LABEL = 'Schließen';
export const CANCEL_LABEL = 'Abbrechen';

export const cratesLabel = (count: number): string => (count === 1 ? '1 Kiste' : `${count} Kisten`);

export const dayLabelOf = (name: PourDayName, dayKey: string): string => {
  if (name === 'today') {
    return 'Heute';
  }

  return name === 'yesterday' ? 'Gestern' : weekdayDateOf(dayKey);
};

export const daysLabel = (days: number): string => {
  if (days === 0) {
    return 'seit heute';
  }

  return days === 1 ? 'seit gestern' : `seit ${days} Tagen`;
};

export const fullNameOf = (person: LabBeerPerson | null): string =>
  person === null ? 'Unbekannt' : `${person.firstName} ${person.lastName}`;

export const firstNameOf = (person: LabBeerPerson | null): string =>
  person === null ? 'Unbekannt' : person.firstName;

export const namesList = (names: readonly string[]): string =>
  names.length < 2
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} oder ${names.at(-1) ?? ''}`;

export const VIEWER_LABELS: Record<PourViewer, string> = {
  openTab: 'Lena · offen',
  bigDebt: 'Kevin · lange offen',
  allPaid: 'Paul · bezahlt',
  former: 'Dieter · beendet',
  fresh: 'Anna · neu',
  notEnrolled: 'Nina · nicht dabei',
  owner: 'Sabine · Inhaberin',
  operator: 'Frank · Helfer',
};

export const LAB_SWITCH_LABEL = 'Labor · ansehen als';

export const STATE_LABELS = { open: 'offen', paid: 'bezahlt', part: 'teils' } as const;

export const REASON_LABELS: Record<LabBeerCorrectionReason, string> = {
  shrinkage: 'Schwund',
  breakage: 'Bruch',
  miscount: 'Zählfehler',
};

export const refusalText = (refusal: LabBeerRefusal, operators: string): string => {
  switch (refusal) {
    case 'outOfStock':
      return 'So viele Kisten sind nicht mehr im Bestand.';
    case 'notEnrolled':
      return 'Du nimmst nicht an der Bierliste teil.';
    case 'undoWindowClosed':
      return `Zu spät zum Zurücknehmen – das korrigiert jetzt ${operators}.`;
    case 'moreThanOpen':
      return 'So viele Kisten sind nicht offen.';
    case 'countOutOfRange':
      return 'Diese Anzahl geht nicht.';
    default:
      return 'Das geht so nicht.';
  }
};

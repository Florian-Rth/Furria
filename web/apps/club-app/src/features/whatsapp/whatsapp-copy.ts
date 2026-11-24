import type { KkStatusTone } from '@furria/ui/KkStatusLine';
import type { UnassignedCopy } from '@/features/calendar/whatsapp-answers';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { formatEuros } from '@/lib/money';
import type { WhatsAppState } from './schemas';

export const WHATSAPP_TITLE = 'WhatsApp';
export const WHATSAPP_SECTION_TITLE = 'Anbindungen';

export const CONNECTION_TITLE = 'Verbindung';
export const BOT_PHONE_LABEL = 'Nummer des Bots';

export const LINK_TITLE = 'Verknüpfen';
export const LINK_QR_LABEL = 'QR-Code zum Verknüpfen des Bots';
export const LINK_QR_STEPS =
  'Auf dem Vereinshandy in WhatsApp: Einstellungen › Verknüpfte Geräte › Gerät hinzufügen.';
export const LINK_QR_PENDING = 'QR-Code wird geladen …';
export const LINK_QR_FAILED = 'Kein QR-Code verfügbar. Er wird gleich erneut abgefragt.';
export const PAIRING_PHONE_LABEL = 'Nummer des Vereinshandys';
export const PAIRING_REQUEST_LABEL = 'Code anfordern';
export const PAIRING_CODE_LABEL = 'Kopplungscode';
export const PAIRING_CODE_STEPS =
  'Gerät hinzufügen › Stattdessen mit Telefonnummer verknüpfen, dann den Code eingeben.';

export const CLUB_GROUP_TITLE = 'Vereinsgruppe';
export const CLUB_GROUP_LABEL = 'Vereinsgruppe wählen';
export const CLUB_GROUP_EMPTY =
  'Der Bot ist in keiner Gruppe. Füge ihn in WhatsApp der Vereinsgruppe hinzu.';
export const CLUB_GROUP_GONE = 'Der Bot ist nicht mehr in der verknüpften Vereinsgruppe.';
export const CLUB_GROUP_PICKED_NOTICE = 'Vereinsgruppe verknüpft.';

export const GROUP_KEEPING_TITLE = 'Mitglieder hinzufügen';
export const GROUP_KEEPING_LABEL = 'Vereinsgruppe verwalten';
export const GROUP_KEEPING_DESCRIPTION =
  'Der Bot fügt aktive Mitglieder mit Einwilligung und Handynummer zur Vereinsgruppe hinzu.';
export const INVITE_LINK_LABEL = 'Einladungslink';
export const REFUSED_ADDS_TITLE = 'Hinzufügen blockiert';
export const REFUSED_ADDS_HINT =
  'WhatsApp lässt das Hinzufügen nicht zu. Den Einladungslink persönlich weitergeben.';
export const REFUSED_ADDS_EMPTY = 'Niemand';
export const NO_PHONE_VALUE = 'keine Nummer';

export const toGroupKeepingNotice = (keepsMembers: boolean): string =>
  keepsMembers ? 'Der Bot fügt jetzt Mitglieder hinzu.' : 'Der Bot fügt niemanden mehr hinzu.';

export const toRefusedAddMeta = (phone: string | null, refusedAt: string): string =>
  `${phone ?? NO_PHONE_VALUE} · blockiert seit ${formatIsoDay(toIsoDay(new Date(refusedAt)))}`;

export const CLUB_ASSISTANT_TITLE = 'Vereinsassistent';
export const CLUB_ASSISTANT_LABEL = 'Vereinsassistent';
export const CLUB_ASSISTANT_DESCRIPTION =
  'Beantwortet private Nachrichten von Mitgliedern mit Daten aus Furria.';
export const CLUB_ASSISTANT_NO_KEY =
  'Für den Vereinsassistenten fehlt noch der Zugang zum KI-Anbieter.';
export const CLUB_ASSISTANT_USED_LABEL = 'Diesen Monat verbraucht';
export const CLUB_ASSISTANT_BUDGET_LABEL = 'Budget pro Monat in €';
export const CLUB_ASSISTANT_QUESTIONS_LABEL = 'Fragen pro Person und Tag';
export const CLUB_ASSISTANT_SAVE_LABEL = 'Speichern';
export const CLUB_ASSISTANT_SAVED_NOTICE = 'Vereinsassistent gespeichert.';
export const CLUB_ASSISTANT_FAILED_MESSAGE = 'Der Vereinsassistent konnte nicht geladen werden.';
export const CLUB_ASSISTANT_BUDGET_INVALID = 'Ganze Euro von 0 bis 1000.';
export const CLUB_ASSISTANT_QUESTIONS_INVALID = 'Eine ganze Zahl von 1 bis 500.';

export const START_LINKING_LABEL = 'Bot verknüpfen';
export const LINKING_STARTED_NOTICE = 'Verknüpfung gestartet.';

export const WHATSAPP_DENIED_MESSAGE = 'Die WhatsApp-Verbindung sehen nur Administratoren.';
export const WHATSAPP_FAILED_MESSAGE = 'Der WhatsApp-Stand konnte nicht geladen werden.';

export interface WhatsAppStateCopy {
  tone: KkStatusTone;
  text: string;
}

export const STATE_COPY: Record<WhatsAppState, WhatsAppStateCopy> = {
  off: { tone: 'quiet', text: 'Nicht eingerichtet' },
  unreachable: { tone: 'conflict', text: 'WhatsApp-Dienst nicht erreichbar' },
  stopped: { tone: 'quiet', text: 'Nicht verknüpft' },
  starting: { tone: 'busy', text: 'Startet …' },
  scanQrCode: { tone: 'busy', text: 'Wartet auf Verknüpfung' },
  working: { tone: 'done', text: 'Verbunden' },
  failed: { tone: 'conflict', text: 'Getrennt' },
};

export const PHONE_WHATSAPP_HINT = 'Wird mit WhatsApp abgeglichen.';
export const THROUGH_WHATSAPP_NOTE = 'über WhatsApp';
const UNASSIGNED_TAB_LABEL = 'Nicht zugeordnet';
const UNKNOWN_SENDER_NAME = 'Unbekannt';
export const UNASSIGNED_COPY: UnassignedCopy = {
  label: UNASSIGNED_TAB_LABEL,
  unknownSender: UNKNOWN_SENDER_NAME,
};

export const toClubAssistantUsage = (usedEuros: number, budgetEuros: number): string =>
  `${formatEuros(usedEuros)} von ${formatEuros(budgetEuros)}`;

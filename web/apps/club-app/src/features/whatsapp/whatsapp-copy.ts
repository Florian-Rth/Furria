import type { KkStatusTone } from '@furria/ui/KkStatusLine';
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

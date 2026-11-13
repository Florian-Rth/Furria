import type { KkNoticeRequest } from '@furria/ui/KkNotice';
import type { PushReadiness } from './push-readiness';
import type { PushTopicsTally } from './push-topics';
import type { PushDelivery, PushTopic } from './schemas';
import type { TestPushReport } from './test-push-report';

export const PUSH_SECTION_TITLE = 'Benachrichtigungen';

export const PUSH_SWITCH_LABEL = 'Auf diesem Gerät benachrichtigen';

export const PUSH_READINESS_NOTES: Partial<Record<PushReadiness, string>> = {
  'install-first':
    'Auf dem iPhone kommen Mitteilungen nur in der App an, die auf dem Home-Bildschirm liegt. Öffne FURRIA von dort.',
  unsupported: 'Dieser Browser kann keine Mitteilungen empfangen.',
  blocked:
    'Mitteilungen von FURRIA sind in den Einstellungen deines Geräts blockiert. Erlaube sie dort, dann kannst du sie hier einschalten.',
};

export interface PushTopicCopy {
  label: string;
  description: string;
}

export const PUSH_TOPIC_COPY: Record<PushTopic, PushTopicCopy> = {
  invitations: {
    label: 'Einladungen',
    description: 'Neue Termine, bei denen du dabei bist oder zu- oder absagen sollst',
  },
  changes: {
    label: 'Änderungen und Absagen',
    description: 'Wenn sich ein Termin verschiebt oder ausfällt',
  },
  reminders: {
    label: 'Erinnerungen',
    description: 'Offene Zusagen, Abstimmungen und Eintragungen',
  },
  announcements: {
    label: 'Aushänge',
    description: 'Wenn ein neuer Aushang erscheint',
  },
  beerTab: {
    label: 'Bierliste',
    description: 'Wenn deine offenen Kisten bezahlt werden wollen',
  },
  beerStock: {
    label: 'Bierbestand',
    description: 'Wenn das Bier bald ausgeht',
  },
};

export const PUSH_TOPICS_LABEL = 'Themen';

export const PUSH_TOPICS_ACTION = 'Auswählen';

export const PUSH_TOPICS_SHEET_ID = 'push-topics';

export const PUSH_TOPICS_SHEET_TITLE = 'Benachrichtigungen';

export const PUSH_TOPICS_SHEET_CLOSE = 'Schließen';

export const PUSH_TOPICS_SHEET_DONE = 'Fertig';

export const PUSH_TOPIC_SWITCH_FAILED =
  'Die Einstellung ließ sich nicht speichern. Versuch es noch einmal.';

export const pushTopicsTallyLabelOf = (tally: PushTopicsTally): string => {
  switch (tally.kind) {
    case 'all':
      return 'Alles';
    case 'none':
      return 'Nichts';
    case 'some':
      return `${tally.enabled} von ${tally.total}`;
  }
};

export const PUSH_ASK_EYEBROW = 'Benachrichtigungen';

export const PUSH_ASK_HEADLINE = { line1: 'Nichts', line2: 'verpassen' } as const;

export const PUSH_ASK_LATER_NOTE = 'Das kannst du jederzeit in deinem Profil ändern.';

export const PUSH_ASK_NEXT = 'Weiter';

export const PUSH_SWITCHED_ON = 'Dieses Gerät bekommt jetzt Mitteilungen.';

export const PUSH_SWITCHED_OFF = 'Dieses Gerät bekommt keine Mitteilungen mehr.';

export const PUSH_SWITCH_FAILED = 'Das hat nicht geklappt. Versuch es noch einmal.';

export const PUSH_PERMISSION_REFUSED =
  'Ohne deine Erlaubnis kann FURRIA keine Mitteilungen schicken.';

export const TEST_PUSH_ACTION = 'Testnachricht senden';

export const TEST_PUSH_FAILED = 'Die Testnachricht ließ sich nicht senden. Versuch es noch einmal.';

const deviceCount = (count: number): string => (count === 1 ? '1 Gerät' : `${count} Geräte`);

const testPushMessageOf = (report: TestPushReport, delivery: PushDelivery): string => {
  switch (report) {
    case 'no-device':
      return 'Auf keinem deiner Geräte sind Benachrichtigungen eingeschaltet. Schalte sie in deinem Profil ein.';
    case 'unreached':
      return 'Keines deiner Geräte war erreichbar. Abgemeldete Geräte sind entfernt.';
    case 'partly-reached':
      return `An ${deviceCount(delivery.delivered)} gesendet, ${deviceCount(delivery.failed)} nicht erreicht.`;
    case 'reached':
      return `An ${deviceCount(delivery.delivered)} gesendet.`;
  }
};

const TEST_PUSH_TONES: Record<TestPushReport, KkNoticeRequest['tone']> = {
  'no-device': 'info',
  unreached: 'error',
  'partly-reached': 'info',
  reached: 'success',
};

export const testPushNoticeOf = (
  report: TestPushReport,
  delivery: PushDelivery,
): KkNoticeRequest => ({
  tone: TEST_PUSH_TONES[report],
  message: testPushMessageOf(report, delivery),
});

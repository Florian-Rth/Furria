import type { KkNoticeRequest } from '@furria/ui/KkNotice';
import type { PushReadiness } from './push-readiness';
import type { PushDelivery } from './schemas';
import type { TestPushReport } from './test-push-report';

export const PUSH_SECTION_TITLE = 'Benachrichtigungen';

export const PUSH_SWITCH_LABEL = 'Auf diesem Gerät benachrichtigen';

export const PUSH_SWITCH_DESCRIPTION =
  'Erinnerungen und Hinweise aus dem Verein kommen als Mitteilung auf dieses Gerät, auch wenn die App geschlossen ist.';

export const PUSH_READINESS_NOTES: Partial<Record<PushReadiness, string>> = {
  'install-first':
    'Auf dem iPhone kommen Mitteilungen nur in der App an, die auf dem Home-Bildschirm liegt. Öffne FURRIA von dort.',
  unsupported: 'Dieser Browser kann keine Mitteilungen empfangen.',
  blocked:
    'Mitteilungen von FURRIA sind in den Einstellungen deines Geräts blockiert. Erlaube sie dort, dann kannst du sie hier einschalten.',
};

export const PUSH_SWITCHED_ON = 'Dieses Gerät bekommt jetzt Mitteilungen.';

export const PUSH_SWITCHED_OFF = 'Dieses Gerät bekommt keine Mitteilungen mehr.';

export const PUSH_SWITCH_FAILED = 'Das hat nicht geklappt. Versuch es noch einmal.';

export const PUSH_PERMISSION_REFUSED =
  'Ohne deine Erlaubnis kann FURRIA keine Mitteilungen schicken.';

export const TEST_PUSH_ACTION = 'Testnachricht senden';

export const TEST_PUSH_LEAD =
  'Schickt eine Mitteilung an jedes deiner Geräte, auf dem Benachrichtigungen eingeschaltet sind.';

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

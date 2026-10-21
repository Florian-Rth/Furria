import type { KkIconName } from '@furria/ui';
import type {
  InstallBrowser,
  InstallDevice,
  InstallSystem,
  InstallTarget,
} from './install-browser';
import type { InstallExit, InstallStepKey } from './install-guide';
import type { InstallPhase } from './install-phase';

interface InstallStepCopy {
  icon: KkIconName;
  action: string;
  label: string;
  hint?: string;
}

export const INSTALL_STEPS: Record<InstallStepKey, InstallStepCopy> = {
  'safari-page-menu': {
    icon: 'menu',
    action: 'Tippe auf',
    label: 'Seitenmenü',
    hint: 'Unten, direkt links neben der Adresse.',
  },
  'safari-more': {
    icon: 'actions',
    action: 'Tippe auf',
    label: 'Mehr',
    hint: 'Die drei Punkte unten rechts neben der Adresse.',
  },
  'safari-share': { icon: 'share', action: 'Wähle', label: 'Teilen' },
  'share-bar': {
    icon: 'share',
    action: 'Tippe auf',
    label: 'Teilen',
    hint: 'Das Quadrat mit Pfeil, unten in der Mitte.',
  },
  'share-top': {
    icon: 'share',
    action: 'Tippe auf',
    label: 'Teilen',
    hint: 'Das Quadrat mit Pfeil, oben rechts.',
  },
  'address-share': {
    icon: 'share',
    action: 'Tippe auf',
    label: 'Teilen',
    hint: 'Oben rechts in der Adresszeile.',
  },
  'home-screen': {
    icon: 'addToHome',
    action: 'Wähle',
    label: 'Zum Home-Bildschirm',
    hint: 'Nicht zu sehen? Im Menü etwas nach unten wischen.',
  },
  'home-screen-list': {
    icon: 'addToHome',
    action: 'Wähle',
    label: 'Zu Home-Bildschirm hinzufügen',
    hint: 'In der Liste nach unten scrollen. Fehlt es: ganz unten „Aktionen bearbeiten“.',
  },
  'web-app-add': {
    icon: 'check',
    action: 'Tippe oben rechts auf',
    label: 'Hinzufügen',
    hint: 'Vorher „Als Web-App öffnen“ einschalten.',
  },
  add: { icon: 'check', action: 'Tippe oben rechts auf', label: 'Hinzufügen' },
  'add-web-app': {
    icon: 'check',
    action: 'Tippe oben rechts auf',
    label: 'Hinzufügen',
    hint: '„Als Web-App öffnen“ bleibt dabei eingeschaltet.',
  },
  'chrome-menu': {
    icon: 'menuVertical',
    action: 'Tippe auf',
    label: 'Menü',
    hint: 'Die drei Punkte oben rechts neben der Adresse.',
  },
  'chrome-install': {
    icon: 'installApp',
    action: 'Wähle',
    label: 'App installieren',
    hint: 'Heißt manchmal „Zum Startbildschirm hinzufügen“.',
  },
  'chrome-confirm': {
    icon: 'check',
    action: 'Bestätige mit',
    label: 'Installieren',
    hint: 'Nicht „Verknüpfung erstellen“.',
  },
  'samsung-menu': {
    icon: 'menu',
    action: 'Tippe auf',
    label: 'Menü',
    hint: 'Die drei Striche unten rechts in der Leiste.',
  },
  'samsung-add-page': { icon: 'addToHome', action: 'Wähle', label: 'Seite hinzufügen zu' },
  'samsung-home': { icon: 'check', action: 'Wähle', label: 'Startbildschirm' },
  'firefox-menu': {
    icon: 'menuVertical',
    action: 'Tippe auf',
    label: 'Menü',
    hint: 'Die drei Punkte oben rechts – oder unten, wenn die Leiste unten ist.',
  },
  'firefox-add': {
    icon: 'installApp',
    action: 'Wähle',
    label: 'Zum Startbildschirm hinzufügen',
  },
  'firefox-confirm': { icon: 'check', action: 'Bestätige mit', label: 'Hinzufügen' },
  'in-app-menu': {
    icon: 'actions',
    action: 'Tippe auf',
    label: 'Mehr',
    hint: 'Die drei Punkte oben rechts in dieser Ansicht.',
  },
  'open-in-safari': { icon: 'openInBrowser', action: 'Wähle', label: 'In Safari öffnen' },
  'open-in-browser': {
    icon: 'openInBrowser',
    action: 'Wähle',
    label: 'Im Browser öffnen',
    hint: 'Dann Chrome nehmen.',
  },
};

const BROWSER_LABEL: Record<InstallBrowser, string> = {
  'ios-safari': 'Safari',
  'ios-other': 'Browser',
  'android-chrome': 'Chrome',
  'android-samsung': 'Samsung Internet',
  'android-firefox': 'Firefox',
  'android-other': 'Browser',
  'in-app': 'App-Ansicht',
  desktop: 'Browser',
};

const DEVICE_LABEL: Record<InstallSystem, Record<InstallDevice, string>> = {
  ios: { phone: 'iPhone', tablet: 'iPad', desktop: 'Mac' },
  android: { phone: 'Android', tablet: 'Android', desktop: 'Android' },
  other: { phone: 'Handy', tablet: 'Tablet', desktop: 'Computer' },
};

export const targetLabelOf = ({ system, browser, device }: InstallTarget): string =>
  `${DEVICE_LABEL[system][device]} · ${BROWSER_LABEL[browser]}`;

export const CLUB_LABEL = 'FURRIA Club';
export const APP_LABEL = 'FURRIA';
export const STEPS_LABEL = 'So kommt die App auf den Startbildschirm';

interface InstallHeadline {
  line1: string;
  line2: string;
}

export const PHASE_HEADLINES: Record<Exclude<InstallPhase, 'guide'>, InstallHeadline> = {
  installing: { line1: 'Gleich', line2: 'geschafft' },
  installed: { line1: 'Jetzt', line2: 'öffnen' },
  elsewhere: { line1: 'Schon', line2: 'installiert' },
};

export const GUIDE_HEADLINE: InstallHeadline = { line1: 'Hol dir', line2: 'die App' };

export const EXIT_HEADLINES: Record<InstallExit, InstallHeadline> = {
  safari: { line1: 'Erst in', line2: 'Safari öffnen' },
  chrome: { line1: 'Erst in', line2: 'Chrome öffnen' },
};

export const EXIT_LEAD = 'Hier kann die App nicht auf den Startbildschirm. Im Browser klappt es.';
export const INSTALLED_LEAD =
  'Du findest FURRIA jetzt auf deinem Startbildschirm. Diesen Tab kannst du schließen.';
export const INSTALLING_LEAD = 'Dein Handy legt die App gerade an.';
export const ELSEWHERE_LEAD =
  'Öffne FURRIA über das Symbol auf deinem Startbildschirm, dann geht’s weiter.';

export const PROMPT_ACTION = 'App installieren';
export const PROMPT_HINT = 'Ein Tipp, dann bestätigen – fertig.';
export const CONFIRM_DONE_ACTION = 'Erledigt, ist auf dem Startbildschirm';
export const REOPEN_GUIDE_ACTION = 'Anleitung nochmal zeigen';
export const COPY_LINK_ACTION = 'Link kopieren';
export const LINK_COPIED = 'Kopiert – im Browser einfügen';

export const EXIT_ACTIONS: Record<InstallExit, string> = {
  safari: 'In Safari öffnen',
  chrome: 'In Chrome öffnen',
};

export const CELEBRATION_CALL = 'Groß – Furria!';

export const stepFactsOf = (stepCount: number): string => `${stepCount} Schritte · 20 Sek.`;
export const PROMPT_FACTS = '1 Tipp · 5 Sek.';
export const BROWSER_MODE_LEAVE_EYEBROW = 'Zum Testen';
export const BROWSER_MODE_LEAVE_CLOSE = 'Schließen';

export const SECRET_TILE_LABEL = 'FURRIA';
export const BROWSER_MODE_TAG = 'Browser';
export const BROWSER_MODE_TAG_LABEL = 'Browser-Ansicht zum Testen beenden';
export const BROWSER_MODE_LEAVE_TITLE = 'Browser-Ansicht beenden?';
export const BROWSER_MODE_LEAVE_BODY =
  'Diese Ansicht ist zum Testen. Danach zeigt dieses Gerät im Browser wieder die Installation.';
export const BROWSER_MODE_LEAVE_CONFIRM = 'Beenden';
export const BROWSER_MODE_LEAVE_CANCEL = 'Weiter testen';
